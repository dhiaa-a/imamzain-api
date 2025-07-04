import { PrismaClient } from '@prisma/client';
import { 
  CreateAttachmentRequest, 
  UpdateAttachmentRequest, 
  AttachmentResponse,
  AttachmentWithRelations,
  AttachmentFilters,
  PaginatedAttachmentsResponse
} from '../types/attachment.types';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const getFileTypeDirectory = (mimeType: string): string => {
  const mainType = mimeType.split('/')[0];
  
  switch (mainType) {
    case 'image':
      return 'images';
    case 'video':
      return 'videos';
    case 'audio':
      return 'audios';
    case 'application':
    case 'text':
      return 'documents';
    default:
      return 'others';
  }
};

export const createUploadDirectories = (): void => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const subdirs = ['images', 'documents', 'videos', 'audios', 'others'];

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    subdirs.forEach(subdir => {
      const subdirPath = path.join(uploadDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
  } catch (error) {
    throw new Error(`Failed to create upload directories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createAttachment = async (data: CreateAttachmentRequest): Promise<AttachmentResponse> => {
  try {
    const attachment = await prisma.attachments.create({
      data: {
        originalName: data.originalName,
        fileName: data.fileName,
        path: data.path,
        mimeType: data.mimeType,
        size: data.size,
        altText: data.altText,
        metadata: data.metadata
      }
    });

    return attachment;
  } catch (error) {
    throw new Error(`Failed to create attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAttachmentById = async (id: number): Promise<AttachmentWithRelations | null> => {
  try {
    const attachment = await prisma.attachments.findUnique({
      where: { id },
      include: {
        // Main image relations
        articlesAsMainImage: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { isDefault: true },
              select: { title: true }
            }
          }
        },
        booksAsCover: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { isDefault: true },
              select: { title: true }
            }
          }
        },
        
        // File relations
        researchesAsFile: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { isDefault: true },
              select: { title: true }
            }
          }
        },
        booksAsFile: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { isDefault: true },
              select: { title: true }
            }
          }
        },
        
        // Additional attachments (only articles remain)
        articleAttachments: {
          select: {
            id: true,
            articleId: true,
            article: {
              select: {
                id: true,
                slug: true,
                translations: {
                  where: { isDefault: true },
                  select: { title: true }
                }
              }
            }
          }
        }
      }
    });

    if (!attachment) return null;

    // Format the response to flatten title from translations
    const formattedAttachment = {
      ...attachment,
      articlesAsMainImage: attachment.articlesAsMainImage.map(article => ({
        id: article.id,
        slug: article.slug,
        title: article.translations[0]?.title
      })),
      booksAsCover: attachment.booksAsCover.map(book => ({
        id: book.id,
        slug: book.slug,
        title: book.translations[0]?.title
      })),
      researchesAsFile: attachment.researchesAsFile.map(research => ({
        id: research.id,
        slug: research.slug,
        title: research.translations[0]?.title
      })),
      booksAsFile: attachment.booksAsFile.map(book => ({
        id: book.id,
        slug: book.slug,
        title: book.translations[0]?.title
      })),
      articleAttachments: attachment.articleAttachments.map(articleAttachment => ({
        id: articleAttachment.id,
        articleId: articleAttachment.articleId,
        article: {
          id: articleAttachment.article.id,
          slug: articleAttachment.article.slug,
          title: articleAttachment.article.translations[0]?.title
        }
      }))
    };

    return formattedAttachment;
  } catch (error) {
    throw new Error(`Failed to get attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllAttachments = async (
  page: number = 1,
  limit: number = 10,
  filters: AttachmentFilters = {}
): Promise<PaginatedAttachmentsResponse> => {
  try {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters.mimeType) {
      where.mimeType = {
        contains: filters.mimeType,
        mode: 'insensitive'
      };
    }
    
    if (filters.originalName) {
      where.originalName = {
        contains: filters.originalName,
        mode: 'insensitive'
      };
    }
    
    if (filters.minSize !== undefined || filters.maxSize !== undefined) {
      where.size = {};
      if (filters.minSize !== undefined) {
        where.size.gte = filters.minSize;
      }
      if (filters.maxSize !== undefined) {
        where.size.lte = filters.maxSize;
      }
    }
    
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore;
      }
    }

    const [attachments, total] = await Promise.all([
      prisma.attachments.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.attachments.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      attachments,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    throw new Error(`Failed to get attachments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateAttachment = async (id: number, data: UpdateAttachmentRequest): Promise<AttachmentResponse | null> => {
  try {
    const existingAttachment = await prisma.attachments.findUnique({
      where: { id }
    });

    if (!existingAttachment) {
      return null;
    }

    const attachment = await prisma.attachments.update({
      where: { id },
      data: {
        ...(data.originalName && { originalName: data.originalName }),
        ...(data.fileName && { fileName: data.fileName }),
        ...(data.path && { path: data.path }),
        ...(data.mimeType && { mimeType: data.mimeType }),
        ...(data.size && { size: data.size }),
        ...(data.altText !== undefined && { altText: data.altText }),
        ...(data.metadata !== undefined && { metadata: data.metadata })
      }
    });

    return attachment;
  } catch (error) {
    throw new Error(`Failed to update attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteAttachment = async (id: number): Promise<boolean> => {
  try {
    const attachment = await prisma.attachments.findUnique({
      where: { id },
      include: {
        // Check if attachment is being used
        articlesAsMainImage: { select: { id: true } },
        booksAsCover: { select: { id: true } },
        researchesAsFile: { select: { id: true } },
        booksAsFile: { select: { id: true } },
        articleAttachments: { select: { id: true } }
      }
    });

    if (!attachment) {
      return false;
    }

    // Check if attachment is being used
    const isInUse = 
      attachment.articlesAsMainImage.length > 0 ||
      attachment.booksAsCover.length > 0 ||
      attachment.researchesAsFile.length > 0 ||
      attachment.booksAsFile.length > 0 ||
      attachment.articleAttachments.length > 0;

    if (isInUse) {
      throw new Error('Cannot delete attachment: it is currently being used by one or more entities');
    }

    // Convert HTTP URL back to file system path for deletion
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const relativePath = attachment.path.replace(baseUrl, '');
    const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ''));

    // Delete the physical file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn(`Failed to delete physical file: ${fileError}`);
    }

    await prisma.attachments.delete({
      where: { id }
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};