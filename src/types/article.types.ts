// src/types/article.types.ts
<<<<<<< HEAD
import { SupportedLanguageCode } from "./language.types";
=======
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c

export interface CreateArticleRequest {
  slug?: string; // Now optional - will be auto-generated if not provided
  categoryId: number;
  date: string; // ISO date string
  translations: CreateArticleTranslation[];
  attachments?: ArticleAttachmentRequest[]; // Optional attachments during creation
}

export interface CreateArticleTranslation {
<<<<<<< HEAD
  languageCode: SupportedLanguageCode;
=======
  languageCode: string;
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  isDefault: boolean;
  title: string;
  summary: string;
  body: string;
}

export interface UpdateArticleRequest {
  slug?: string;
  categoryId?: number;
  date?: string;
  translations?: UpdateArticleTranslation[];
  attachments?: ArticleAttachmentRequest[]; // Optional attachments during update
}

export interface UpdateArticleTranslation {
  id?: number; // if updating existing translation
<<<<<<< HEAD
  languageCode: SupportedLanguageCode;
=======
  languageCode: string;
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  isDefault?: boolean;
  title: string;
  summary: string;
  body: string;
}

export interface ArticleResponse {
  id: number;
  slug: string;
  views: number;
  date: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    slug: string;
    name: string;
  };
  translations: ArticleTranslationResponse[];
  attachments: ArticleAttachmentResponse[];
}

export interface ArticleAttachmentResponse {
  id: number;
  articleId: number;
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

export interface ArticleTranslationResponse {
  id: number;
  articleId: number;
<<<<<<< HEAD
  languageCode: SupportedLanguageCode;
=======
  languageCode: string;
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  isDefault: boolean;
  title: string;
  summary: string;
  body: string;
  language: {
    code: string;
    name: string;
    nativeName: string;
  };
}

export interface GetArticlesQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
<<<<<<< HEAD
  languageCode?: SupportedLanguageCode;
=======
  languageCode?: string;
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  search?: string;
}

export interface ArticleAttachmentRequest {
  attachmentId: number;
<<<<<<< HEAD
  type: 'featured' | 'gallery' | 'attachment' | 'other';
=======
  type: 'image' | 'attachment' | 'other';
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  order: number;
}