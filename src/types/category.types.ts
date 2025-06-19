// src/types/category.types.ts
import { SupportedLanguageCode } from "./language.types";

export interface CreateCategoryRequest {
  slug?: string; // Optional - will be auto-generated if not provided
  name: string; // Simplified: single name field
  translations?: CreateCategoryTranslation[]; // Optional for future use
}

export interface CreateCategoryTranslation {
  languageCode: SupportedLanguageCode;
  isDefault: boolean;
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  slug?: string;
  name?: string; // Simplified: single name field
  translations?: UpdateCategoryTranslation[]; // Optional for future use
}

export interface UpdateCategoryTranslation {
  id?: number; // if updating existing translation
  languageCode: SupportedLanguageCode;
  isDefault?: boolean;
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  translations: CategoryTranslationResponse[];
  _count?: {
    articles: number;
  };
}

export interface CategoryTranslationResponse {
  id: number;
  categoryId: number;
  languageCode: SupportedLanguageCode;
  isDefault: boolean;
  name: string;
  description?: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

export interface GetCategoriesQuery {
  page?: number;
  limit?: number;
  languageCode?: SupportedLanguageCode;
  search?: string;
  includeCount?: boolean; // Whether to include article count
}