export interface CreateAttachmentRequest {
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  altText?: string | null;
  metadata?: any;
}

export interface UpdateAttachmentRequest {
  originalName?: string;
  fileName?: string;
  path?: string;
  mimeType?: string;
  size?: number;
  altText?: string | null;
  metadata?: any;
}

export interface AttachmentResponse {
  id: number;
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  altText: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentWithRelations extends AttachmentResponse {
  articleAttachments?: {
    id: number;
    articleId: number;
    order: number;
  }[];
  researchAttachments?: {
    id: number;
    researchId: number;
    order: number;
  }[];
  bookAttachments?: {
    id: number;
    bookId: number;
    order: number;
  }[];
}

export interface AttachmentFilters {
  mimeType?: string;
  originalName?: string;
  minSize?: number;
  maxSize?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PaginatedAttachmentsResponse {
  attachments: AttachmentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileUploadMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  quality?: string;
}