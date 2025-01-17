import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchLog } from '../schemas/search-log.schema';

export class GetLogsDto {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, enum: ['EXTERNAL_SEARCH', 'LOCAL_SEARCH'] })
  @IsEnum(['EXTERNAL_SEARCH', 'LOCAL_SEARCH'])
  @IsOptional()
  operation?: 'EXTERNAL_SEARCH' | 'LOCAL_SEARCH';

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

export class LogsResponse {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pages: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [SearchLog] })
  items: SearchLog[];
}
