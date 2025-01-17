import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export interface MetricsResponse {
  operation: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  totalRequests: number;
  timeseriesData: TimeSeriesData[];
}

@Injectable()
export class BooksMetricsService implements OnModuleInit {
  private client: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      url: this.configService.get('REDIS_URI'),
    });

    await this.client.connect();

    // Create time series if they don't exist
    for (const operation of ['external_search', 'local_search']) {
      const key = `api:${operation}:duration`;
      try {
        await this.client.ts.create(key, {
          RETENTION: 7 * 24 * 60 * 60 * 1000,
          LABELS: { operation },
        });
      } catch (error) {
        // Ignore "key already exists" error
        if (!error.message.includes('key already exists')) {
          throw error;
        }
      }
    }
  }

  async recordSearchDuration(
    operation: 'external_search' | 'local_search',
    duration: number,
  ) {
    const key = `api:${operation}:duration`;
    await this.client.ts.add(key, '*', duration);
  }

  async getMetrics(
    operation: 'external_search' | 'local_search',
    timeRange: number = 3600000,
  ): Promise<MetricsResponse> {
    const key = `api:${operation}:duration`;
    const now = Date.now();
    const fromTimestamp = now - timeRange;

    const [rangeData, stats] = await Promise.all([
      this.client.ts.range(key, fromTimestamp, now),
      this.client.ts.range(key, fromTimestamp, now, {
        AGGREGATION: {
          type: 'avg',
          timeBucket: 60000, // 1-minute aggregation
        },
      }),
    ]);

    const values = rangeData.map((point) => point.value);

    return {
      operation,
      avgDuration: values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0,
      minDuration: values.length ? Math.min(...values) : 0,
      maxDuration: values.length ? Math.max(...values) : 0,
      totalRequests: values.length,
      timeseriesData: stats.map((point) => ({
        timestamp: point.timestamp,
        value: point.value,
      })),
    };
  }
}
