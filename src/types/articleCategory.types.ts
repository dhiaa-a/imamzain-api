export interface ArticleCategoryTranslation {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface ArticleCategory {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: ArticleCategoryTranslation[];
  parent?: ArticleCategory;
  children?: ArticleCategory[];
}

export interface CreateArticleCategoryRequest {
  slug?: string; // Now optional - will be auto-generated if not provided
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
  translations: {
    languageCode: string;
    isDefault: boolean;
    name: string;
  }[];
}

export interface UpdateArticleCategoryRequest {
  slug?: string;
  parentId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
  translations?: {
    id?: number;
    languageCode: string;
    isDefault: boolean;
    name: string;
  }[];
}

export interface ArticleCategoryResponse {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: ArticleCategoryTranslation[];
  parent?: {
    id: number;
    slug: string;
    translations: ArticleCategoryTranslation[];
  } | null;
  children?: {
    id: number;
    slug: string;
    translations: ArticleCategoryTranslation[];
  }[];
}