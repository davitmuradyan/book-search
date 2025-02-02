import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { MongoService } from './database/mongo.service';
import { RedisService } from '../shared/services/redis.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URI'),
          ttl: 60 * 60,
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
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
    },
    MongoService,
    RedisService,
  ],
  exports: [MongoService, RedisService],
})
export class CoreModule {} 