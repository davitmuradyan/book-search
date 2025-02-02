import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  authors: string[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  firstPublishYear?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  isbns?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  publishers?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  openLibraryId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  searchKeywords?: string[];
}

export class SearchQueryDto {
  @ApiProperty({ example: 'gatsby' })
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class BookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [String] })
  authors: string[];

  @ApiProperty()
  firstPublishYear: number;

  @ApiProperty({ type: [String] })
  isbns: string[];

  @ApiProperty({ type: [String] })
  publishers: string[];

  @ApiProperty()
  openLibraryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
