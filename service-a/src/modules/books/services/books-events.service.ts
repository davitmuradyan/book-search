import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { SearchEventDto } from '../dto/search.dto';

@Injectable()
export class BooksEventsService {
  private readonly logger = new Logger(BooksEventsService.name);

  constructor(
    @Inject('BOOKS_SERVICE') private readonly client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to message broker');
    } catch (error) {
      this.logger.error('Failed to connect to message broker', error.stack);
      throw error;
    }
  }

  async publishSearchEvent(event: SearchEventDto): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit('book.search', {
          ...event,
          timestamp: new Date(),
        })
      );
      
      this.logger.debug(
        `Published search event: ${event.operation} - ${event.query} - ${event.success ? 'success' : 'failed'}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish search event: ${error.message}`,
        error.stack
      );
      // Don't throw the error to prevent affecting the main flow
      // But you might want to add metrics or alerts here
    }
  }

  async onApplicationShutdown() {
    try {
      await this.client.close();
      this.logger.log('Successfully closed message broker connection');
    } catch (error) {
      this.logger.error('Error closing message broker connection', error.stack);
    }
  }
} 