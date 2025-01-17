export interface IOpenLibraryResponse {
  docs: IOpenLibraryBook[];
  numFound: number;
  start: number;
}

export interface IOpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  publisher?: string[];
  language?: string[];
  number_of_pages?: number;
}
