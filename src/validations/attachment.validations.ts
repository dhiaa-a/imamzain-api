import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const createAttachmentSchema = z.object({
  body: z.object({
    originalName: z.string().min(1, 'Original name is required').max(255, 'Original name too long'),
    fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
    path: z.string().min(1, 'Path is required').max(500, 'Path too long'),
    mimeType: z.string().min(1, 'MIME type is required').max(100, 'MIME type too long'),
    size: z.number().int().positive('Size must be a positive integer'),
    altText: z.string().max(500, 'Alt text too long').nullable().optional(),
    metadata: z.any().optional()
  })
});

const updateAttachmentSchema = z.object({
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

const getAttachmentSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid attachment ID'
    })
  })
});

const deleteAttachmentSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Invalid attachment ID'
    })
  })
});

export const createValidation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createAttachmentSchema.parse(req);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    next(error);
  }
};

export const updateValidation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateAttachmentSchema.parse(req);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    next(error);
  }
};

export const deleteValidation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    deleteAttachmentSchema.parse(req);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    next(error);
  }
};