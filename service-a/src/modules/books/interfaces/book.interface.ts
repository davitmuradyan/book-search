import { ObjectId } from 'mongodb';

export interface Book {
  _id?: ObjectId;
  title: string;
  authors: string[];
  firstPublishYear: number;
  isbns: string[];
  publishers: string[];
  openLibraryId: string;
  searchKeywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  publisher?: string[];
}

export interface IOpenLibraryResponse {
  numFound: number;
  start: number;
  docs: IOpenLibraryBook[];
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}
