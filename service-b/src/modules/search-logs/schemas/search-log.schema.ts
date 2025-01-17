import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchLogDocument = SearchLog & Document;

@Schema({
  timestamps: true,
  collection: 'search_logs',
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class SearchLog {
  @Prop({
    required: true,
    enum: ['EXTERNAL_SEARCH', 'LOCAL_SEARCH'],
    index: true,
  })
  operation: 'EXTERNAL_SEARCH' | 'LOCAL_SEARCH';

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true })
  query: string;

  @Prop({ required: true })
  resultsCount: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true, index: true })
  success: boolean;

  @Prop()
  error?: string;
}

export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);

// Compound indexes
SearchLogSchema.index({ operation: 1, timestamp: -1 });
SearchLogSchema.index({ success: 1, timestamp: -1 });
