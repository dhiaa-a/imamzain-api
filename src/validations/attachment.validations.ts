import { z } from 'zod';

export const createAttachmentSchema = z.object({
  body: z.object({
    altText: z.string().max(500, 'Alt text too long').optional(),
    metadata: z.string().optional().transform((val) => {
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Invalid JSON format for metadata');
      }
    })
  })
});

export const updateAttachmentSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid attachment ID'
    })
  }),
  body: z.object({
    originalName: z.string().min(1, 'Original name is required').max(255, 'Original name too long').optional(),
    fileName: z.string().min(1, 'File name is required').max(255, 'File name too long').optional(),
    path: z.string().min(1, 'Path is required').max(500, 'Path too long').optional(),
    mimeType: z.string().min(1, 'MIME type is required').max(100, 'MIME type too long').optional(),
    size: z.number().int().positive('Size must be a positive integer').optional(),
    altText: z.string().max(500, 'Alt text too long').nullable().optional(),
    metadata: z.any().optional()
  })
});

export const getAttachmentSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid attachment ID'
    })
  })
});

export const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid attachment ID'
    })
  })
});