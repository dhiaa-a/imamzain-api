export interface BookData {
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

export interface BookAttachmentData {
  id: number;
  bookId: number;
  attachmentsId: number;
  type: string;
  order: number;
  caption?: string;
}

export interface AttachmentData {
  id: number;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  disk: string;
  collection?: string;
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
  attachments: (BookAttachmentData & {
    attachment: AttachmentData;
  })[];
}

export interface CreateBookRequest {
  isbn?: string;
  pages?: number;
  parts?: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId: number;
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
  parts?: number;
  partNumber?: number;
  totalParts?: number;
  publishYear?: string;
  isPublished?: boolean;
  categoryId?: number;
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
  limit?: number;
  offset?: number;
  search?: string;
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
  attachments: {
    id: number;
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
      altText?: string;
    };
  }[];
}