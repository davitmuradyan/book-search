import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../shared/services/redis.service';
import { Book } from '../interfaces/book.interface';
import { SearchResponse } from '../dto/search.dto';

@Injectable()
export class BooksCacheService {
  private readonly BOOK_KEY_PREFIX = 'book:';
  private readonly SEARCH_KEY_PREFIX = 'search:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(private readonly redisService: RedisService) {}

  async getBook(openLibraryId: string): Promise<Book | null> {
    return this.redisService.get<Book>(`${this.BOOK_KEY_PREFIX}${openLibraryId}`);
  }

  async setBook(book: Book): Promise<void> {
    await this.redisService.set(
      `${this.BOOK_KEY_PREFIX}${book.openLibraryId}`,
      book,
      this.DEFAULT_TTL
    );
  }

  async getSearchResults(query: string): Promise<SearchResponse | null> {
    return this.redisService.get<SearchResponse>(
      `${this.SEARCH_KEY_PREFIX}${query}`
    );
  }

  async setSearchResults(query: string, results: SearchResponse): Promise<void> {
    await this.redisService.set(
      `${this.SEARCH_KEY_PREFIX}${query}`,
      results,
      this.DEFAULT_TTL
    );
  }

  async invalidateBook(openLibraryId: string): Promise<void> {
    await this.redisService.del(`${this.BOOK_KEY_PREFIX}${openLibraryId}`);
  }

  async invalidateSearch(query: string): Promise<void> {
    await this.redisService.del(`${this.SEARCH_KEY_PREFIX}${query}`);
  }
} 