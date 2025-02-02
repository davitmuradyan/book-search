import { ObjectId } from 'mongodb';

export type SearchOperation = 'EXTERNAL_SEARCH' | 'LOCAL_SEARCH';

export interface SearchLog {
  _id?: ObjectId;
  operation: SearchOperation;
  timestamp: Date;
  query: string;
  resultsCount: number;
  duration: number;
  success: boolean;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const searchLogIndexes = [
  { key: { operation: 1 }, background: true },
  { key: { timestamp: 1 }, background: true },
  { key: { success: 1 }, background: true },
  { key: { operation: 1, timestamp: -1 }, background: true },
  { key: { success: 1, timestamp: -1 }, background: true },
];
