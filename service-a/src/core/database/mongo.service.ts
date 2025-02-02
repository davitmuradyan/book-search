import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import { MongoClient, Collection } from 'mongodb';

@Injectable()
export class MongoService implements OnApplicationShutdown {
  constructor(
    @Inject('MONGODB_CONNECTION') private readonly mongoClient: MongoClient
  ) {}

  getCollection<T>(collectionName: string): Collection<T> {
    return this.mongoClient.db().collection<T>(collectionName);
  }

  async onApplicationShutdown() {
    await this.mongoClient.close();
  }
} 