export interface ResearchCategoryTranslation {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface ResearchCategory {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: ResearchCategoryTranslation[];
  parent?: ResearchCategory;
  children?: ResearchCategory[];
}

export interface CreateResearchCategoryRequest {
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

export interface UpdateResearchCategoryRequest {
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

export interface ResearchCategoryResponse {
  id: number;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: ResearchCategoryTranslation[];
  parent?: {
    id: number;
    slug: string;
    translations: ResearchCategoryTranslation[];
  } | null;
  children?: {
    id: number;
    slug: string;
    translations: ResearchCategoryTranslation[];
  }[];
}