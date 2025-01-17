import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BooksEventsService } from './books-events.service';
import { BooksMetricsService } from './books-metrics.service';
import { MetricsController } from './metrics.controller';
import { Book, BookSchema } from './schemas/book.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'BOOKS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: 'books_events_queue',
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
  providers: [BooksService, BooksEventsService, BooksMetricsService],
})
export class BooksModule {}
