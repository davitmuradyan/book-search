import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchLog, SearchLogDocument } from './schemas/search-log.schema';
import { GetLogsDto, LogsResponse } from './dto/get-logs.dto';

@Injectable()
export class SearchLogsService {
  private readonly logger = new Logger(SearchLogsService.name);

  constructor(
    @InjectModel(SearchLog.name)
    private searchLogModel: Model<SearchLogDocument>,
  ) {}

  async getLogs(params: GetLogsDto): Promise<LogsResponse> {
    const { startDate, endDate, operation, page = 1, limit = 20 } = params;

    // Build query
    const query: any = {};

    // Date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Operation filter
    if (operation) {
      query.operation = operation;
    }

    try {
      // Execute query with pagination
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        this.searchLogModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.searchLogModel.countDocuments(query),
      ]);

      return {
        items: results,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      };
    } catch (error) {
      this.logger.error(`Error fetching logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logSearchEvent(event: any) {
    try {
      const searchLog = new this.searchLogModel(event);
      await searchLog.save();
      this.logger.log(
        `Logged search event: ${event.operation} - ${event.query}`,
      );
    } catch (error) {
      this.logger.error(
        `Error logging search event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
