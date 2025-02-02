import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SearchLogsController } from './search-logs.controller';
import { SearchLogsService } from './search-logs.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'SEARCH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: 'search_logs_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SearchLogsController],
  providers: [
    SearchLogsService,
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
  exports: [SearchLogsService],
})
export class SearchLogsModule {}
