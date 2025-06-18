// src/types/attachment.types.ts
import { Request } from "express";

export interface CreateAttachmentRequest {
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  disk?: string;
  collection?: string;
  altText?: string;
  metadata?: Record<string, any>;
}

export interface UpdateAttachmentRequest {
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  size?: number;
  disk?: string;
  collection?: string;
  altText?: string;
  metadata?: Record<string, any>;
}

export interface AttachmentResponse {
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
  url: string; // Generated URL for accessing the file
}

export interface GetAttachmentsQuery {
  page?: number;
  limit?: number;
  mimeType?: string;
  collection?: string;
  search?: string;
  disk?: string;
}

export interface ArticleAttachmentRequest {
  attachmentId: number;
  type: 'image' | 'attachment' | 'other';
  order: number;
}

export interface ArticleWithAttachments {
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
  translations: any[];
  attachments: ArticleAttachmentResponse[];
}

export interface ArticleAttachmentResponse {
  id: number;
  articleId: number;
  attachmentId: number;
  type: string;
  order: number;
  attachment: AttachmentResponse;
}

// File upload types
export interface FileUploadRequest {
  collection?: string;
  altText?: string;
  metadata?: Record<string, any>;
}

// File type validation
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv'
];

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB