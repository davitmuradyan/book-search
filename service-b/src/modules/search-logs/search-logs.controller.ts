import { Controller, Get, Query, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchLogsService } from './search-logs.service';
import { GetLogsDto, LogsResponse } from './dto/get-logs.dto';

@ApiTags('logs')
@Controller('logs')
export class SearchLogsController {
  private readonly logger = new Logger(SearchLogsController.name);

  constructor(private readonly searchLogsService: SearchLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get search logs with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns search logs',
    type: LogsResponse,
  })
  async getLogs(@Query() query: GetLogsDto): Promise<LogsResponse> {
    return this.searchLogsService.getLogs(query);
  }

  @EventPattern('book.search.executed')
  async handleSearchEvent(data: any) {
    this.logger.log(`Received search event: ${data.operation}`);
    await this.searchLogsService.logSearchEvent(data);
  }
}
