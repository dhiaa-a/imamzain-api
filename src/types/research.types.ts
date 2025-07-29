export interface CreateResearchRequest {
  translations: {
    languageCode: string;
    isDefault: boolean;
    title: string;
    abstract?: string;
    authors?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
  categoryId: number;
  tagIds?: number[];
  fileId?: number;
  publishedAt?: Date;
  pages?: number;
  isPublished?: boolean;
}

export interface UpdateResearchRequest {
  translations?: {
    languageCode: string;
    isDefault: boolean;
    title: string;
    abstract?: string;
    authors?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
  categoryId?: number;
  tagIds?: number[];
  fileId?: number;
  publishedAt?: Date;
  pages?: number;
  isPublished?: boolean;
}

export interface ResearchResponse {
  id: number;
  slug: string;
  title: string;
  abstract?: string;
  authors?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  pages?: number;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    slug: string;
    name: string;
  };
  tags?: {
    id: number;
    slug: string;
    name: string;
  }[];
  file?: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    altText?: string;
  };
}

export interface ResearchListResponse {
  researches: ResearchResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ResearchFilters {
  categoryId?: number;
  tagIds?: number[];
  search?: string;
  isPublished?: boolean;
  publishedYear?: string;
}