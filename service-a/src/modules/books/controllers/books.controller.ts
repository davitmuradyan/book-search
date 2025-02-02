import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BooksService } from '../services/books.service';
import { SearchBooksDto, SearchResponse } from '../dto/search.dto';
import { Book } from '../interfaces/book.interface';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search books in local database' })
  @ApiResponse({ status: 200, type: SearchResponse })
  async searchBooks(@Query() searchDto: SearchBooksDto): Promise<SearchResponse> {
    return this.booksService.searchStoredBooks(searchDto);
  }

  @Post('external-search')
  @ApiOperation({ summary: 'Search and import books from OpenLibrary' })
  @ApiResponse({ status: 200, isArray: true })
  async searchExternal(@Query('q') query: string): Promise<Book[]> {
    return this.booksService.searchAndSaveBooks(query);
  }
}