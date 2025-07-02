import { ModelType } from '@prisma/client';

export interface CategoryTranslationData {
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface CreateCategoryRequest {
  slug: string;
  model: ModelType;
  isActive?: boolean;
  translations: CategoryTranslationData[];
}

export interface UpdateCategoryRequest {
  slug?: string;
  model?: ModelType;
  isActive?: boolean;
  translations?: CategoryTranslationData[];
}

export interface CategoryResponse {
  id: number;
  slug: string;
  model: ModelType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: CategoryTranslationData[];
}

export interface CategoryListResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryFilters {
  model?: ModelType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}