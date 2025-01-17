import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: ['F. Scott Fitzgerald'] })
  @IsArray()
  @IsOptional()
  authors: string[];

  @ApiProperty({ example: 1925 })
  @IsNumber()
  @IsOptional()
  firstPublishYear?: number;

  @ApiProperty({ example: ['9780743273565'] })
  @IsArray()
  @IsOptional()
  isbns?: string[];

  @ApiProperty({ example: ['Scribner'] })
  @IsArray()
  @IsOptional()
  publishers?: string[];

  @ApiProperty({ example: '/works/OL123M' })
  @IsString()
  @IsNotEmpty()
  openLibraryId: string;
}

export class SearchQueryDto {
  @ApiProperty({ example: 'gatsby' })
  @IsString()
  @IsNotEmpty()
  q: string;
}
