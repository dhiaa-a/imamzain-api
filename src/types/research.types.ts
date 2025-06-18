// src/types/research.types.ts

export interface CreateResearchRequest {
  slug?: string; // Optional - will be auto-generated if not provided
  date: string; // ISO date string
  pages: number;
  categoryId: number;
  translations: CreateResearchTranslation[];
  attachments?: ResearchAttachmentRequest[]; // Optional attachments during creation
}

export interface CreateResearchTranslation {
  languageCode: string;
  isDefault: boolean;
  title: string;
  abstract: string;
}

export interface UpdateResearchRequest {
  slug?: string;
  date?: string;
  pages?: number;
  categoryId?: number;
  translations?: UpdateResearchTranslation[];
  attachments?: ResearchAttachmentRequest[];
}

export interface UpdateResearchTranslation {
  id?: number; // if updating existing translation
  languageCode: string;
  isDefault?: boolean;
  title: string;
  abstract: string;
}

export interface ResearchResponse {
  id: number;
  slug: string;
  date: string;
  views: number;
  pages: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    slug?: string;
    name?: string;
  };
  translations: ResearchTranslationResponse[];
  attachments: ResearchAttachmentResponse[];
}

export interface ResearchTranslationResponse {
  id: number;
  researchId: number;
  languageCode: string;
  isDefault: boolean;
  title: string;
  abstract: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

export interface ResearchAttachmentRequest {
  attachmentId: number;
  type: 'pdf' | 'image' | 'other';
  order: number;
}

export interface ResearchAttachmentResponse {
  id: number;
  researchId: number;
  attachmentId: number;
  type: string;
  order: number;
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
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    url: string;
  };
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

// Research Category interfaces
export interface CreateResearchCategoryRequest {
  slug: string;
  name: string;
}

export interface UpdateResearchCategoryRequest {
  slug?: string;
  name?: string;
}

export interface ResearchCategoryResponse {
  id: number;
  slug?: string;
  name?: string;
  researchCount?: number;
}