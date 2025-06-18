// src/types/book.types.ts

export interface CreateBookRequest {
  slug?: string; // Optional - will be auto-generated if not provided
  pages: number;
  parts: number;
  partNumber: number;
  totalParts: number;
  categoryId: number;
  translations: CreateBookTranslation[];
  attachments?: BookAttachmentRequest[]; // Optional attachments during creation
}

export interface CreateBookTranslation {
  languageCode: string;
  isDefault: boolean;
  title: string;
  author: string;
  printHouse: string;
  printDate: string;
  series: string;
  names?: string[]; // Array of book names
}

export interface UpdateBookRequest {
  slug?: string;
  pages?: number;
  parts?: number;
  partNumber?: number;
  totalParts?: number;
  categoryId?: number;
  translations?: UpdateBookTranslation[];
  attachments?: BookAttachmentRequest[];
}

export interface UpdateBookTranslation {
  id?: number; // if updating existing translation
  languageCode: string;
  isDefault?: boolean;
  title: string;
  author: string;
  printHouse: string;
  printDate: string;
  series: string;
  names?: string[];
}

export interface BookResponse {
  id: number;
  slug: string;
  pages: number;
  parts: number;
  views: number;
  partNumber: number;
  totalParts: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    slug: string;
    name: string;
  };
  translations: BookTranslationResponse[];
  attachments: BookAttachmentResponse[];
}

export interface BookTranslationResponse {
  id: number;
  bookId: number;
  languageCode: string;
  isDefault: boolean;
  title: string;
  author: string;
  printHouse: string;
  printDate: string;
  series: string;
  names: string[];
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

export interface BookAttachmentRequest {
  attachmentId: number;
  type: 'cover' | 'pdf' | 'other';
  order: number;
}

export interface BookAttachmentResponse {
  id: number;
  bookId: number;
  attachmentId: number;
  type: string;
  order: number;
  attachment: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    disk: string;
    collection?: string;
    altText?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    url: string;
  };
}

export interface GetBooksQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  languageCode?: string;
  search?: string;
  author?: string;
  series?: string;
}

// Book Type (Category) interfaces
export interface CreateBookTypeRequest {
  slug: string;
  name: string;
}

export interface UpdateBookTypeRequest {
  slug?: string;
  name?: string;
}

export interface BookTypeResponse {
  id: number;
  slug: string;
  name: string;
  booksCount?: number;
}