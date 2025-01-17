import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchBooksDto {
  @ApiProperty({ required: false, description: 'Text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, description: 'Author name' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false, description: 'Publication year' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiProperty({ required: false, description: 'ISBN' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiProperty({
    required: false,
    enum: ['title', 'year', 'relevance'],
    default: 'relevance',
  })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'year', 'relevance'])
  sortBy?: 'title' | 'year' | 'relevance' = 'relevance';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiProperty({ required: false, minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class SearchResponse<T> {
  @ApiProperty()
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
