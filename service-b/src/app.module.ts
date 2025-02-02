import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { SearchLogsModule } from './modules/search-logs/search-logs.module';

const mongoClientProvider = {
  provide: 'MONGODB_CONNECTION',
  useFactory: async (configService: ConfigService) => {
    const mongoUri = configService.get<string>('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    const client = new MongoClient(mongoUri);
    await client.connect();
    return client;
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SearchLogsModule,
  ],
  providers: [mongoClientProvider],
})
export class AppModule {}
