// src/types/research.types.ts
export interface CreateResearchRequest {
  slug?: string;
  date: string;              // This maps to publishedAt in schema
  pages?: number;
  isPublished?: boolean;     // New field
  categoryId: number;
  translations: CreateResearchTranslationRequest[];
  attachments?: CreateResearchAttachmentRequest[];
}

export interface UpdateResearchRequest {
  slug?: string;
  date?: string;             // This maps to publishedAt in schema
  pages?: number;
  isPublished?: boolean;     // New field
  categoryId?: number;
  translations?: UpdateResearchTranslationRequest[];
  attachments?: UpdateResearchAttachmentRequest[];
}

export interface CreateResearchTranslationRequest {
  languageCode: string;
  isDefault: boolean;
  title: string;
  abstract?: string;
  keywords?: string;         // New field
  authors?: string;          // New field
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
}

export interface UpdateResearchTranslationRequest {
  languageCode: string;
  isDefault: boolean;
  title: string;
  abstract?: string;
  keywords?: string;         // New field
  authors?: string;          // New field
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
}

export interface CreateResearchAttachmentRequest {
  attachmentId: number;
  type: 'pdf' | 'cover' | 'attachment' | 'other';
  order: number;
  caption?: string; // New field
}

export interface UpdateResearchAttachmentRequest {
  attachmentId: number;
  type: 'pdf' | 'cover' | 'attachment' | 'other';
  order: number;
  caption?: string; // New field
}

export interface ResearchResponse {
  id: number;
  slug: string;
  publishedAt: string | null; // Updated from date
  views: number;
  pages?: number;
  isPublished: boolean;       // New field
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: any;
  translations: ResearchTranslationResponse[];
  attachments: ResearchAttachmentResponse[];
}

export interface ResearchTranslationResponse {
  id: number;
  researchId: number;
  languageCode: string;
  isDefault: boolean;
  title: string;
  abstract?: string;
  keywords?: string;         // New field
  authors?: string;          // New field
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
  language: any;
}

export interface ResearchAttachmentResponse {
  id: number;
  researchId: number;
  attachmentId: number;
  type: string;
  order: number;
  caption?: string; // New field
  attachment: {
    id: number;
    originalName: string;
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
    disk: string;
    collection?: string;
    altText?: string;
    metadata: any;
    createdAt: string;
    updatedAt: string;
    url: string;
  };
}

export interface CreateResearchCategoryRequest {
  slug: string;
  parentId?: number;         // New field
  sortOrder?: number;        // New field
  isActive?: boolean;        // New field
  translations?: CreateResearchCategoryTranslationRequest[];
}

export interface UpdateResearchCategoryRequest {
  slug?: string;
  parentId?: number;         // New field
  sortOrder?: number;        // New field
  isActive?: boolean;        // New field
  translations?: UpdateResearchCategoryTranslationRequest[];
}

export interface CreateResearchCategoryTranslationRequest {
  languageCode: string;
  isDefault: boolean;
  name: string;
  description?: string;
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
}

export interface UpdateResearchCategoryTranslationRequest {
  languageCode: string;
  isDefault: boolean;
  name: string;
  description?: string;
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
}

export interface ResearchCategoryResponse {
  id: number;
  slug: string;
  parentId?: number;         // New field
  sortOrder: number;         // New field
  isActive: boolean;         // New field
  createdAt: string;         // New field
  updatedAt: string;         // New field
  translations: ResearchCategoryTranslationResponse[];
  researchCount: number;
}

export interface ResearchCategoryTranslationResponse {
  id: number;
  categoryId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
  description?: string;
  metaTitle?: string;        // New field
  metaDescription?: string;  // New field
  language: any;
}

export interface GetResearchQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  languageCode?: string;
  search?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetResearchCategoriesQuery {
  page?: number;
  limit?: number;
  languageCode?: string;
  search?: string;
  includeCount?: boolean;
}