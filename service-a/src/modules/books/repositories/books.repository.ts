import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MongoService } from '../../../core/database/mongo.service';
import { Book } from '../schemas/book.schema';
import { CreateBookDto } from '../dto/book.dto';
import { SearchBooksDto } from '../dto/search.dto';

@Injectable()
export class BooksRepository {
  private readonly collection: Collection<Book>;

  constructor(private readonly mongoService: MongoService) {
    this.collection = this.mongoService.getCollection<Book>('books');
  }

  async findByOpenLibraryId(id: string): Promise<Book | null> {
    return this.collection.findOne({ openLibraryId: id });
  }

  async upsert(book: CreateBookDto): Promise<Book> {
    const result = await this.collection.findOneAndUpdate(
      { openLibraryId: book.openLibraryId },
      { $set: book },
      { upsert: true, returnDocument: 'after' }
    );
    return result;
  }

  async search(params: SearchBooksDto) {
    const { q, page = 1, limit = 20 } = params;
    const skip = (page - 1) * Number(limit);
    const limitNum = Number(limit);

    const textQuery = q ? { $text: { $search: q } } : {};
    const sortOptions = q ? { score: { $meta: 'textScore' } } : { _id: -1 };

    const [results, total] = await Promise.all([
      this.collection
        .find(textQuery)
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      this.collection.countDocuments(textQuery),
    ]);

    return {
      items: results,
      total,
      page,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    };
  }
} 