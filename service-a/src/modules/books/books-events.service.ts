import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BookEvent } from './interfaces/book-event.interface';

@Injectable()
export class BooksEventsService {
  constructor(@Inject('BOOKS_SERVICE') private readonly client: ClientProxy) {}

  async publishSearchEvent(event: BookEvent) {
    return this.client.emit('book.search.executed', event);
  }
}
