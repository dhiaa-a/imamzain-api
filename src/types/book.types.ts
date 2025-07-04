export interface BookData {
  id: number;
  slug: string;
  isbn?: string;
  pages?: number;
  views: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished: boolean;
  categoryId: number;
  coverId?: number;        // New field for cover image
  fileId?: number;         // New field for book file
  parentBookId?: number;   // New field for self-relation
  createdAt: Date;
  updatedAt: Date;
}

export interface BookTranslationData {
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
}

export interface BookCategoryData {
  id: number;
  slug: string;
  model: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookCategoryTranslationData {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface AttachmentData {
  id: number;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  altText?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookWithTranslations extends BookData {
  translations: BookTranslationData[];
  category: BookCategoryData & {
    translations: BookCategoryTranslationData[];
  };
  cover?: AttachmentData;    // Direct cover relation
  file?: AttachmentData;     // Direct file relation
  parentBook?: BookData & {  // Self-relation to parent
    translations: BookTranslationData[];
  };
  parts?: BookData[];        // Self-relation to child parts
  tags?: {
    id: number;
    tag: {
      id: number;
      slug: string;
      translations: {
        name: string;
      }[];
    };
  }[];
}

export interface CreateBookRequest {
  isbn?: string;
  pages?: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId: number;
  coverId?: number;         // New field for cover image
  fileId?: number;          // New field for book file
  parentBookId?: number;    // New field for parent book
  tagIds?: number[];        // Tag associations
  translations: {
    languageCode: string;
    isDefault?: boolean;
    title: string;
    author?: string;
    publisher?: string;
    description?: string;
    series?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
}

export interface UpdateBookRequest {
  isbn?: string;
  pages?: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId?: number;
  coverId?: number;         // New field for cover image
  fileId?: number;          // New field for book file
  parentBookId?: number;    // New field for parent book
  tagIds?: number[];        // Tag associations
  translations?: {
    languageCode: string;
    isDefault?: boolean;
    title: string;
    author?: string;
    publisher?: string;
    description?: string;
    series?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
}

export interface BookQuery {
  categoryId?: number;
  isPublished?: boolean;
  publishYear?: string;
  parentBookId?: number;    // Filter by parent book
  hasParent?: boolean;      // Filter for parts or main books
  tagIds?: number[];        // Filter by tags
  limit?: number;
  offset?: number;
  search?: string;
}

export interface BookResponse {
  id: number;
  slug: string;
  isbn?: string;
  pages?: number;
  views: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished: boolean;
  categoryId: number;
  coverId?: number;
  fileId?: number;
  parentBookId?: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  author?: string;
  publisher?: string;
  description?: string;
  series?: string;
  metaTitle?: string;
  metaDescription?: string;
  category: {
    id: number;
    slug: string;
    name: string;
  };
  cover?: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    altText?: string;
  };
  file?: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    altText?: string;
  };
  parentBook?: {
    id: number;
    slug: string;
    title: string;
  };
  parts?: {
    id: number;
    slug: string;
    title: string;
    partNumber?: number;
  }[];
  tags?: {
    id: number;
    slug: string;
    name: string;
  }[];
}

export interface CreateBookCategoryRequest {
  translations: {
    languageCode: string;
    isDefault?: boolean;
    name: string;
  }[];
}

export interface UpdateBookCategoryRequest {
  translations?: {
    languageCode: string;
    isDefault?: boolean;
    name: string;
  }[];
}