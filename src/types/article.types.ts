export interface CreateArticleRequest {
  translations: {
    languageCode: string;
    isDefault: boolean;
    title: string;
    summary?: string;
    body: string;
  }[];
  categoryId: number;
  tagIds?: number[];
  attachmentIds?: number[];
  mainImageId?: number;  // New field for main image
  publishedAt?: string;
  isPublished?: boolean;
}

export interface UpdateArticleRequest {
  translations?: {
    languageCode: string;
    isDefault: boolean;
    title: string;
    summary?: string;
    body: string;
  }[];
  categoryId?: number;
  tagIds?: number[];
  attachmentIds?: number[];
  mainImageId?: number;  // New field for main image
  publishedAt?: string;
  isPublished?: boolean;
}

export interface ArticleResponse {
  id: number;
  slug: string;
  views: number;
  publishedAt: Date | null;
  isPublished: boolean;
  categoryId: number;
  mainImageId?: number;  // New field for main image
  createdAt: Date;
  updatedAt: Date;
  title: string;
  summary?: string;
  body: string;
  category?: {
    id: number;
    slug: string;
    name: string;
  };
  mainImage?: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    altText?: string;
  };
  tags?: {
    id: number;
    slug: string;
    name: string;
  }[];
  attachments?: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    altText?: string;
    // Removed order field
  }[];
}

export interface ArticleListResponse {
  articles: ArticleResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleFilters {
  categoryId?: number;
  tagIds?: number[];
  isPublished?: boolean;
  search?: string;
}