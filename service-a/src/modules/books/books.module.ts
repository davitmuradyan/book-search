import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CoreModule } from '../../core/core.module';
import { BooksController } from './controllers/books.controller';
import { BooksService } from './services/books.service';
import { BooksRepository } from './repositories/books.repository';
import { BooksCacheService } from './services/books-cache.service';
import { BooksEventsService } from './services/books-events.service';
import { BooksMetricsService } from './services/books-metrics.service';
import { MetricsController } from './metrics.controller';
import { MongoClient } from 'mongodb';

@Module({
  imports: [
    HttpModule,
    CoreModule,
    ClientsModule.registerAsync([
      {
        name: 'BOOKS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: 'books_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BooksController, MetricsController],
  providers: [
    BooksService,
    BooksRepository,
    BooksCacheService,
    BooksEventsService,
    BooksMetricsService,
    {
      provide: 'MONGODB_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        if (!mongoUri) {
          throw new Error('MONGODB_URI environment variable is not defined');
        }
        const client = new MongoClient(mongoUri);
        await client.connect();
        return client;
      },
    }
  ],
})
export class BooksModule {}
