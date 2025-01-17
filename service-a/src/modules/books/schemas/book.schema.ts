import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Book {
  @Prop({ required: true, text: true })
  title: string;

  @Prop({ type: [String], index: true })
  authors: string[];

  @Prop({ index: true })
  firstPublishYear: number;

  @Prop({ type: [String], index: true })
  isbns: string[];

  @Prop({ type: [String] })
  publishers: string[];

  @Prop({ required: true, unique: true, index: true })
  openLibraryId: string;

  @Prop({ type: [String], index: true })
  searchKeywords: string[];
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Compound indexes for common search patterns
BookSchema.index({ title: 1, authors: 1 });
BookSchema.index({ firstPublishYear: 1, title: 1 });

// Text index for full-text search
BookSchema.index(
  {
    title: 'text',
    authors: 'text',
    publishers: 'text',
    searchKeywords: 'text',
  },
  {
    weights: {
      title: 10,
      authors: 5,
      publishers: 3,
      searchKeywords: 1,
    },
    name: 'BookSearchIndex',
  },
);
