export interface BookCategoryTranslation {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface BookCategory {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: BookCategoryTranslation[];
  parent?: BookCategory;
  children?: BookCategory[];
}

export interface CreateBookCategoryRequest {
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

export interface UpdateBookCategoryRequest {
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

export interface BookCategoryResponse {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: BookCategoryTranslation[];
  parent?: {
    id: number;
    slug: string;
    translations: BookCategoryTranslation[];
  } | null;
  children?: {
    id: number;
    slug: string;
    translations: BookCategoryTranslation[];
  }[];
}