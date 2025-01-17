import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/book.dto';
import { SearchBooksDto, SearchResponse } from './dto/search.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  private readonly logger = new Logger(BooksController.name);

  constructor(private readonly booksService: BooksService) {}

  @Get('external-search')
  @ApiOperation({
    summary: 'Search books from OpenLibrary and save to database',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns found books from OpenLibrary',
    type: [CreateBookDto],
  })
  async searchExternalBooks(@Query('query') query: string) {
    this.logger.log(`Searching OpenLibrary for: ${query}`);
    return this.booksService.searchAndSaveBooks(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search books in local database' })
  @ApiResponse({
    status: 200,
    description: 'Returns searched books with pagination',
    type: SearchResponse,
  })
  async searchStoredBooks(@Query() searchDto: SearchBooksDto) {
    return this.booksService.searchStoredBooks(searchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved books' })
  @ApiResponse({
    status: 200,
    description: 'Returns all books',
    type: [CreateBookDto],
  })
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by id' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a book',
    type: CreateBookDto,
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }
}
