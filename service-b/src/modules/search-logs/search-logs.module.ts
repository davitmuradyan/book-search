import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SearchLogsController } from './search-logs.controller';
import { SearchLogsService } from './search-logs.service';
import { SearchLog, SearchLogSchema } from './schemas/search-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchLog.name, schema: SearchLogSchema },
    ]),
    ClientsModule.register([
      {
        name: 'SEARCH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI],
          queue: 'books_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [SearchLogsController],
  providers: [SearchLogsService],
})
export class SearchLogsModule {}
