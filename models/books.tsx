export interface SearchBook {
  googleBooks: GoogleBooks;
  openLibrary: OpenLibrary;
}

export interface OpenLibrary {
  isbn: Isbn;
  title: string;
  publishedDate: string;
  authors: string[];
  industryIdentifiers: any[];
  printType: string;
  categories: string[];
  imageLinks: ImageLinks;
  previewLink: string;
  infoLink: string;
  publisher: string;
  language: string;
  pages: number;
}

interface ImageLinks {
  smallThumbnail: string;
  thumbnail: string;
}

interface Isbn {
  isbn_10: string[];
  isbn_13: string[];
  openlibrary: string[];
}

export interface GoogleBooks {
  isbn: string | string[];
  title: string;
  publishedDate: string;
  description: string;
  authors: string[];
  printType: string;
  categories: string[];
  imageLinks: ImageLinks;
  previewLink: string;
  infoLink: string;
  publisher: string;
  language: string;
  pages: number;
}
