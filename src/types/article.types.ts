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
    order: number;
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