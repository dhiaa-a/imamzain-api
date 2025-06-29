// src/types/attachment.types.ts

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

export interface GetAttachmentsQuery {
  page?: number;
  limit?: number;
  mimeType?: string;
  collection?: string;
  search?: string;
  disk?: string;
}

export interface AttachmentResponse {
  id: number;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  disk: string;
  collection: string | null;
  altText: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface ArticleAttachmentRequest {
  attachmentId: number;
  type: "featured" | "gallery" | "attachment" | "other";
  order: number;
  caption?: string;
}

// File upload constraints
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB