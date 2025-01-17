import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BooksMetricsService, MetricsResponse } from './books-metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: BooksMetricsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Get search operation metrics' })
  @ApiQuery({ name: 'operation', enum: ['external_search', 'local_search'] })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range in milliseconds (default: 1 hour)',
  })
  async getSearchMetrics(
    @Query('operation') operation: 'external_search' | 'local_search',
    @Query('timeRange') timeRange?: number,
  ): Promise<MetricsResponse> {
    return this.metricsService.getMetrics(operation, timeRange);
  }
}
