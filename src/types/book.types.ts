// src/types/book.types.ts

export interface CreateBookRequest {
  slug?: string; // Optional - will be auto-generated if not provided
  isbn?: string;
  pages: number;
  parts: number;
  partNumber: number;
  totalParts: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId: number;
  translations: CreateBookTranslation[];
  attachments?: BookAttachmentRequest[]; // Optional attachments during creation
}

export interface CreateBookTranslation {
  languageCode: string;
  isDefault: boolean;
  title: string;
  author?: string;
  publisher?: string;
  description?: string;
  series?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBookRequest {
  slug?: string;
  isbn?: string;
  pages?: number;
  parts?: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId?: number;
  translations?: UpdateBookTranslation[];
  attachments?: BookAttachmentRequest[];
}

export interface UpdateBookTranslation {
  id?: number; // if updating existing translation
  languageCode: string;
  isDefault?: boolean;
  title: string;
  author?: string;
  publisher?: string;
  description?: string;
  series?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BookResponse {
  id: number;
  slug: string;
  isbn?: string;
  pages?: number;
  parts?: number;
  views: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    slug: string;
    parentId?: number;
    sortOrder: number;
    isActive: boolean;
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
  author?: string;
  publisher?: string;
  description?: string;
  series?: string;
  metaTitle?: string;
  metaDescription?: string;
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
  caption?: string;
}

export interface BookAttachmentResponse {
  id: number;
  bookId: number;
  attachmentId: number;
  type: string;
  order: number;
  caption?: string;
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

// Book Category interfaces
export interface CreateBookCategoryRequest {
  slug: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
  translations: CreateBookCategoryTranslation[];
}

export interface CreateBookCategoryTranslation {
  languageCode: string;
  isDefault: boolean;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBookCategoryRequest {
  slug?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
  translations?: UpdateBookCategoryTranslation[];
}

export interface UpdateBookCategoryTranslation {
  id?: number;
  languageCode: string;
  isDefault?: boolean;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BookCategoryResponse {
  id: number;
  slug: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  booksCount: number;
  translations: BookCategoryTranslationResponse[];
  children?: BookCategoryResponse[];
}

export interface BookCategoryTranslationResponse {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}