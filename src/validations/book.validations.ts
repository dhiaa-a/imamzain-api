// src/validations/book.validations.ts
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createBookTranslationSchema = z.object({
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
  isDefault: z.boolean(),
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  series: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

const updateBookTranslationSchema = z.object({
  id: z.number().optional(),
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
  isDefault: z.boolean().optional(),
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  series: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

const bookAttachmentSchema = z.object({
  attachmentId: z.number().positive("Attachment ID must be a positive number"),
  type: z.enum(["cover", "pdf", "other"], {
    errorMap: () => ({ message: "Type must be one of: cover, pdf, other" })
  }),
  order: z.number().int("Order must be an integer"),
  caption: z.string().optional()
});

const createBookSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  isbn: z.string().optional(),
  pages: z.number().positive("Pages must be a positive number"),
  parts: z.number().positive("Parts must be a positive number"),
  partNumber: z.number().positive("Part number must be a positive number"),
  totalParts: z.number().positive("Total parts must be a positive number"),
  publishYear: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.number().positive("Category ID must be a positive number"),
  translations: z.array(createBookTranslationSchema)
    .min(1, "At least one translation is required"),
  attachments: z.array(bookAttachmentSchema).optional()
}).refine((data) => {
  return data.partNumber <= data.totalParts;
}, {
  message: "Part number cannot be greater than total parts",
  path: ["partNumber"]
}).refine((data) => {
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  return defaultTranslations.length === 1;
}, {
  message: "Exactly one translation must be marked as default",
  path: ["translations"]
}).refine((data) => {
  if (!data.attachments || data.attachments.length === 0) return true;
  const attachmentIds = data.attachments.map(a => a.attachmentId);
  const uniqueIds = new Set(attachmentIds);
  return uniqueIds.size === attachmentIds.length;
}, {
  message: "Duplicate attachment IDs found",
  path: ["attachments"]
}).refine((data) => {
  if (!data.attachments || data.attachments.length === 0) return true;
  const orders = data.attachments.map(a => a.order);
  const uniqueOrders = new Set(orders);
  return uniqueOrders.size === orders.length;
}, {
  message: "Duplicate attachment order values found",
  path: ["attachments"]
});

const updateBookSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  isbn: z.string().optional(),
  pages: z.number().positive("Pages must be a positive number").optional(),
  parts: z.number().positive("Parts must be a positive number").optional(),
  partNumber: z.number().positive("Part number must be a positive number").optional(),
  totalParts: z.number().positive("Total parts must be a positive number").optional(),
  publishYear: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.number().positive("Category ID must be a positive number").optional(),
  translations: z.array(updateBookTranslationSchema)
    .min(1, "At least one translation is required when updating translations")
    .optional(),
  attachments: z.array(bookAttachmentSchema).optional()
}).refine((data) => {
  if (data.partNumber !== undefined && data.totalParts !== undefined) {
    return data.partNumber <= data.totalParts;
  }
  return true;
}, {
  message: "Part number cannot be greater than total parts",
  path: ["partNumber"]
}).refine((data) => {
  if (!data.translations) return true;
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  return defaultTranslations.length <= 1;
}, {
  message: "At most one translation can be marked as default",
  path: ["translations"]
}).refine((data) => {
  if (!data.attachments || data.attachments.length === 0) return true;
  const attachmentIds = data.attachments.map(a => a.attachmentId);
  const uniqueIds = new Set(attachmentIds);
  return uniqueIds.size === attachmentIds.length;
}, {
  message: "Duplicate attachment IDs found",
  path: ["attachments"]
}).refine((data) => {
  if (!data.attachments || data.attachments.length === 0) return true;
  const orders = data.attachments.map(a => a.order);
  const uniqueOrders = new Set(orders);
  return uniqueOrders.size === orders.length;
}, {
  message: "Duplicate attachment order values found",
  path: ["attachments"]
});

const createBookCategoryTranslationSchema = z.object({
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
  isDefault: z.boolean(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

const updateBookCategoryTranslationSchema = z.object({
  id: z.number().optional(),
  languageCode: z.string().min(2, "Language code must be at least 2 characters"),
  isDefault: z.boolean().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

const createBookCategorySchema = z.object({
  slug: z.string()
    .min(2, "Slug must be at least 2 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentId: z.number().positive("Parent ID must be a positive number").optional(),
  sortOrder: z.number().int("Sort order must be an integer").optional(),
  isActive: z.boolean().optional(),
  translations: z.array(createBookCategoryTranslationSchema)
    .min(1, "At least one translation is required")
}).refine((data) => {
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  return defaultTranslations.length === 1;
}, {
  message: "Exactly one translation must be marked as default",
  path: ["translations"]
});

const updateBookCategorySchema = z.object({
  slug: z.string()
    .min(2, "Slug must be at least 2 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  parentId: z.number().positive("Parent ID must be a positive number").optional(),
  sortOrder: z.number().int("Sort order must be an integer").optional(),
  isActive: z.boolean().optional(),
  translations: z.array(updateBookCategoryTranslationSchema)
    .min(1, "At least one translation is required when updating translations")
    .optional()
}).refine((data) => {
  if (!data.translations) return true;
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  return defaultTranslations.length <= 1;
}, {
  message: "At most one translation can be marked as default",
  path: ["translations"]
});

export function validateCreateBook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    createBookSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors
        }
      });
      return;
    }
    next(error);
  }
}

export function validateUpdateBook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    updateBookSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors
        }
      });
      return;
    }
    next(error);
  }
}

export function validateCreateBookCategory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    createBookCategorySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors
        }
      });
      return;
    }
    next(error);
  }
}

export function validateUpdateBookCategory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    updateBookCategorySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors
        }
      });
      return;
    }
    next(error);
  }
}