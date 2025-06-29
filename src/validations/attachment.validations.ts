// src/validations/attachment.validations.ts
import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ALLOWED_MIME_TYPES } from "../types/attachment.types";

// Zod schemas
const createAttachmentSchema = z.object({
  originalName: z.string().min(1, "Original name is required"),
  fileName: z.string().min(1, "File name is required"),
  path: z.string().min(1, "Path is required"),
  mimeType: z.string().refine(
    (value) => ALLOWED_MIME_TYPES.includes(value),
    {
      message: `MIME type must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`
    }
  ),
  size: z.number().positive("Size must be a positive number"),
  disk: z.string().optional(),
  collection: z.string().optional(),
  altText: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const updateAttachmentSchema = z.object({
  originalName: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
  mimeType: z.string().refine(
    (value) => ALLOWED_MIME_TYPES.includes(value),
    {
      message: `MIME type must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`
    }
  ).optional(),
  size: z.number().positive().optional(),
  disk: z.string().optional(),
  collection: z.string().optional(),
  altText: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const articleAttachmentSchema = z.object({
  attachmentId: z.number().positive("Attachment ID must be a positive number"),
  type: z.enum(["featured", "gallery", "attachment", "other"], {
    errorMap: () => ({ message: "Type must be one of: featured, gallery, attachment, other" })
  }),
  order: z.number().int("Order must be an integer"),
  caption: z.string().optional()
});

const articleAttachmentsSchema = z.object({
  attachments: z.array(articleAttachmentSchema).min(1, "At least one attachment is required")
    .refine(
      (attachments) => {
        const ids = attachments.map(a => a.attachmentId);
        return new Set(ids).size === ids.length;
      },
      { message: "Duplicate attachment IDs are not allowed" }
    )
    .refine(
      (attachments) => {
        const orders = attachments.map(a => a.order);
        return new Set(orders).size === orders.length;
      },
      { message: "Duplicate order values are not allowed" }
    )
});

// Validation middleware functions
export function validateCreateAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    createAttachmentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      });
      return;
    }
    next(error);
  }
}

export function validateUpdateAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    updateAttachmentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      });
      return;
    }
    next(error);
  }
}

export function validateArticleAttachments(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    articleAttachmentsSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        }
      });
      return;
    }
    next(error);
  }
}