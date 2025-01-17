import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom, catchError } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Book, BookDocument } from './schemas/book.schema';
import {
  IOpenLibraryResponse,
  IOpenLibraryBook,
} from './interfaces/book.interface';
import { CreateBookDto } from './dto/book.dto';
import { SearchBooksDto, SearchResponse } from './dto/search.dto';
import { BooksEventsService } from './books-events.service';
import { BooksMetricsService } from './books-metrics.service';

@Injectable()
export class BooksService {
  private readonly baseUrl = 'http://openlibrary.org';
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventsService: BooksEventsService,
    private readonly metricsService: BooksMetricsService,
  ) {}

  async searchAndSaveBooks(query: string) {
    const startTime = Date.now();
    try {
      // Check cache first
      const cacheKey = `search:${query}`;
      const cachedResult = await this.cacheManager.get(cacheKey);

      if (cachedResult) {
        this.logger.log(`Cache hit for query: ${query}`);
        return cachedResult;
      }

      // Fetch from OpenLibrary API
      const response = await firstValueFrom(
        this.httpService
          .get<IOpenLibraryResponse>(`${this.baseUrl}/search.json`, {
            params: {
              q: query,
              limit: 10,
            },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(`OpenLibrary API error: ${error.message}`);
              throw new BadRequestException(
                'Failed to fetch data from OpenLibrary',
              );
            }),
          ),
      );

      // Transform and save books
      const books = await this.processAndSaveBooks(response.data.docs);

      // Cache the results
      await this.cacheManager.set(cacheKey, books, 3600); // Cache for 1 hour

      await Promise.all([
        this.metricsService.recordSearchDuration(
          'external_search',
          Date.now() - startTime,
        ),
        this.eventsService.publishSearchEvent({
          operation: 'EXTERNAL_SEARCH',
          timestamp: new Date(),
          query,
          resultsCount: books.length,
          duration: Date.now() - startTime,
          success: true,
        }),
      ]);

      return books;
    } catch (error) {
      await Promise.all([
        this.metricsService.recordSearchDuration(
          'external_search',
          Date.now() - startTime,
        ),
        this.eventsService.publishSearchEvent({
          operation: 'EXTERNAL_SEARCH',
          timestamp: new Date(),
          query,
          resultsCount: 0,
          duration: Date.now() - startTime,
          success: false,
          error: error.message,
        }),
      ]);
      this.logger.error(`Error in searchAndSaveBooks: ${error.message}`);
      throw error;
    }
  }

  private async processAndSaveBooks(openLibraryBooks: IOpenLibraryBook[]) {
    try {
      const bookPromises = openLibraryBooks.map(async (book) => {
        const createBookDto: CreateBookDto = {
          title: book.title,
          authors: book.author_name || [],
          firstPublishYear: book.first_publish_year,
          isbns: book.isbn || [],
          publishers: book.publisher || [],
          openLibraryId: book.key,
        };

        return this.upsertBook(createBookDto);
      });

      return await Promise.all(bookPromises);
    } catch (error) {
      this.logger.error(`Error in processAndSaveBooks: ${error.message}`);
      throw new BadRequestException('Failed to process and save books');
    }
  }

  private async upsertBook(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const book = await this.bookModel.findOneAndUpdate(
        { openLibraryId: createBookDto.openLibraryId },
        createBookDto,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      return book;
    } catch (error) {
      this.logger.error(`Error upserting book: ${error.message}`);
      throw new BadRequestException('Failed to save book to database');
    }
  }

  async getAllBooks() {
    try {
      const cacheKey = 'all-books';
      const cachedBooks = await this.cacheManager.get(cacheKey);

      if (cachedBooks) {
        return cachedBooks;
      }

      const books = await this.bookModel.find().exec();
      await this.cacheManager.set(cacheKey, books, 3600);

      return books;
    } catch (error) {
      this.logger.error(`Error fetching all books: ${error.message}`);
      throw new BadRequestException('Failed to fetch books');
    }
  }

  async getBookById(id: string) {
    try {
      const cacheKey = `book:${id}`;
      const cachedBook = await this.cacheManager.get(cacheKey);

      if (cachedBook) {
        return cachedBook;
      }

      const book = await this.bookModel.findById(id).exec();
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      await this.cacheManager.set(cacheKey, book, 3600);
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching book by id: ${error.message}`);
      throw new BadRequestException('Failed to fetch book');
    }
  }

  async searchStoredBooks(
    searchDto: SearchBooksDto,
  ): Promise<SearchResponse<Book>> {
    const startTime = Date.now();
    try {
      const { q, author, year, isbn, sortBy, order, page, limit } = searchDto;

      // Build query
      const query: any = {};

      if (q) {
        query.$text = { $search: q };
      }

      if (author) {
        query.authors = { $regex: author, $options: 'i' };
      }

      if (year) {
        query.firstPublishYear = year;
      }

      if (isbn) {
        query.isbns = isbn;
      }

      // Build sort options
      let sortOptions: any = {};
      if (q && sortBy === 'relevance') {
        sortOptions = { score: { $meta: 'textScore' } };
      } else if (sortBy === 'title') {
        sortOptions.title = order === 'asc' ? 1 : -1;
      } else if (sortBy === 'year') {
        sortOptions.firstPublishYear = order === 'asc' ? 1 : -1;
      }

      // Cache key based on search parameters
      const cacheKey = `search:${JSON.stringify({ query, sortOptions, page, limit })}`;
      const cachedResult =
        await this.cacheManager.get<SearchResponse<Book>>(cacheKey);

      if (cachedResult) {
        this.logger.log('Returning cached search results');
        return cachedResult;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        this.bookModel
          .find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.bookModel.countDocuments(query).exec(),
      ]);

      const response: SearchResponse<Book> = {
        items: results,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      };

      // Cache results
      await this.cacheManager.set(cacheKey, response, 300); // Cache for 5 minutes

      await Promise.all([
        this.metricsService.recordSearchDuration(
          'local_search',
          Date.now() - startTime,
        ),
        this.eventsService.publishSearchEvent({
          operation: 'LOCAL_SEARCH',
          timestamp: new Date(),
          query: searchDto.q || '',
          resultsCount: total,
          duration: Date.now() - startTime,
          success: true,
        }),
      ]);

      return response;
    } catch (error) {
      await Promise.all([
        this.metricsService.recordSearchDuration(
          'local_search',
          Date.now() - startTime,
        ),
        this.eventsService.publishSearchEvent({
          operation: 'LOCAL_SEARCH',
          timestamp: new Date(),
          query: searchDto.q || '',
          resultsCount: 0,
          duration: Date.now() - startTime,
          success: false,
          error: error.message,
        }),
      ]);
      this.logger.error(`Search error: ${error.message}`);
      throw new BadRequestException('Failed to search books');
    }
  }
}
