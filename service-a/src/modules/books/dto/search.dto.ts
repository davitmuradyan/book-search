import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Book } from '../interfaces/book.interface';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class SearchBooksDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ required: false, enum: ['title', 'year', 'author'] })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, enum: SortOrder })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder;

  @ApiProperty({ required: false, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

export class SearchResponse<T = any> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pages: number;

  @ApiProperty()
  limit: number;
}

export class SearchEventDto {
  @ApiProperty({ enum: ['EXTERNAL_SEARCH', 'LOCAL_SEARCH'] })
  operation: 'EXTERNAL_SEARCH' | 'LOCAL_SEARCH';

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  query: string;

  @ApiProperty()
  resultsCount: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  error?: string;
}
