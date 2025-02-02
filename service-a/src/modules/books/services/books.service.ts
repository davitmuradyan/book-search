import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { BooksRepository } from '../repositories/books.repository';
import { BooksCacheService } from '../services/books-cache.service';
import { BooksEventsService } from '../services/books-events.service';
import { Book, IOpenLibraryResponse, SearchResult } from '../interfaces/book.interface';
import { CreateBookDto } from '../dto/book.dto';
import { SearchBooksDto } from '../dto/search.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  private readonly baseUrl = 'http://openlibrary.org';

  constructor(
    private readonly httpService: HttpService,
    private readonly booksRepository: BooksRepository,
    private readonly cacheService: BooksCacheService,
    private readonly eventsService: BooksEventsService,
  ) {}

  async searchAndSaveBooks(query: string): Promise<Book[]> {
    const startTime = Date.now();
    try {
      // Check cache
      const cachedResult = await this.cacheService.getSearchResults(query);
      if (cachedResult) {
        this.logger.log(`Cache hit for query: ${query}`);
        return cachedResult.items;
      }

      // Fetch from OpenLibrary API
      const books = await this.fetchAndProcessBooks(query);

      // Cache results
      await this.cacheService.setSearchResults(query, {
        items: books,
        total: books.length,
        page: 1,
        pages: 1,
        limit: books.length
      });

      // Log event
      await this.eventsService.publishSearchEvent({
        operation: 'EXTERNAL_SEARCH',
        timestamp: new Date(),
        query,
        resultsCount: books.length,
        duration: Date.now() - startTime,
        success: true,
      });

      return books;
    } catch (error) {
      await this.eventsService.publishSearchEvent({
        operation: 'EXTERNAL_SEARCH',
        timestamp: new Date(),
        query,
        resultsCount: 0,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  private async fetchAndProcessBooks(query: string): Promise<Book[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<IOpenLibraryResponse>(`${this.baseUrl}/search.json`, {
            params: { q: query, limit: 10 },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(`OpenLibrary API error: ${error.message}`);
              throw new BadRequestException('Failed to fetch data from OpenLibrary');
            }),
          ),
      );

      return Promise.all(
        response.data.docs.map(book => this.processAndSaveBook({
          title: book.title,
          authors: book.author_name || [],
          firstPublishYear: book.first_publish_year,
          isbns: book.isbn || [],
          publishers: book.publisher || [],
          openLibraryId: book.key,
        }))
      );
    } catch (error) {
      this.logger.error(`Error in fetchAndProcessBooks: ${error.message}`);
      throw new BadRequestException('Failed to process books from OpenLibrary');
    }
  }

  private async processAndSaveBook(bookDto: CreateBookDto): Promise<Book> {
    try {
      return await this.booksRepository.upsert(bookDto);
    } catch (error) {
      this.logger.error(`Error saving book: ${error.message}`);
      throw new BadRequestException('Failed to save book');
    }
  }

  async searchStoredBooks(searchDto: SearchBooksDto): Promise<SearchResult<Book>> {
    const startTime = Date.now();
    try {
      const cacheKey = JSON.stringify(searchDto);
      const cachedResult = await this.cacheService.getSearchResults(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const results = await this.booksRepository.search(searchDto);
      await this.cacheService.setSearchResults(cacheKey, results);

      await this.eventsService.publishSearchEvent({
        operation: 'LOCAL_SEARCH',
        timestamp: new Date(),
        query: searchDto.q || '',
        resultsCount: results.total,
        duration: Date.now() - startTime,
        success: true,
      });

      return results;
    } catch (error) {
      await this.eventsService.publishSearchEvent({
        operation: 'LOCAL_SEARCH',
        timestamp: new Date(),
        query: searchDto.q || '',
        resultsCount: 0,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }
} 