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

export const bookIndexes = [
  { key: { title: 1 }, background: true },
  { key: { authors: 1 }, background: true },
  { key: { firstPublishYear: 1 }, background: true },
  { key: { isbns: 1 }, background: true },
  { key: { openLibraryId: 1 }, unique: true, background: true },
  { key: { searchKeywords: 1 }, background: true },
  { key: { title: 1, authors: 1 }, background: true },
  { key: { firstPublishYear: 1, title: 1 }, background: true },
  {
    key: {
      title: 'text',
      authors: 'text',
      publishers: 'text',
      searchKeywords: 'text',
    },
    weights: {
      title: 10,
      authors: 5,
      publishers: 3,
      searchKeywords: 1,
    },
    name: 'BookSearchIndex',
    background: true,
  },
];
