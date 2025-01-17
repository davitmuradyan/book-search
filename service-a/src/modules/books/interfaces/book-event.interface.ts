export interface BookEvent {
  operation: 'EXTERNAL_SEARCH' | 'LOCAL_SEARCH';
  timestamp: Date;
  query: string;
  resultsCount: number;
  duration: number;
  success: boolean;
  error?: string;
}
