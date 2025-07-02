import { z } from 'zod';

export const createBookSchema = z.object({
  isbn: z.string().optional(),
  pages: z.number().int().positive().optional(),
  parts: z.number().int().positive().optional(),
  partNumber: z.number().int().positive().optional(),
  totalParts: z.number().int().positive().optional(),
  publishYear: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
  categoryId: z.number().int().positive(),
  translations: z.array(z.object({
    languageCode: z.string().min(2).max(5),
    isDefault: z.boolean().optional().default(false),
    title: z.string().min(1).max(500),
    author: z.string().max(300).optional(),
    publisher: z.string().max(300).optional(),
    description: z.string().optional(),
    series: z.string().max(300).optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional()
  })).min(1)
});

export const updateBookSchema = z.object({
  isbn: z.string().optional(),
  pages: z.number().int().positive().optional(),
  parts: z.number().int().positive().optional(),
  partNumber: z.number().int().positive().optional(),
  totalParts: z.number().int().positive().optional(),
  publishYear: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
  translations: z.array(z.object({
    languageCode: z.string().min(2).max(5),
    isDefault: z.boolean().optional().default(false),
    title: z.string().min(1).max(500),
    author: z.string().max(300).optional(),
    publisher: z.string().max(300).optional(),
    description: z.string().optional(),
    series: z.string().max(300).optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional()
  })).optional()
});

export const bookQuerySchema = z.object({
  categoryId: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional(),
  isPublished: z.string().transform(val => val === 'true').optional(),
  publishYear: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive().max(100)).optional().default('10'),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(0)).optional().default('0'),
  search: z.string().max(100).optional()
});

export const bookParamsSchema = z.object({
  lang: z.string().min(2).max(5),
  slug: z.string().min(1).max(255)
});

export const bookIdParamsSchema = z.object({
  lang: z.string().min(2).max(5),
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive())
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
export type BookParamsInput = z.infer<typeof bookParamsSchema>;
export type BookIdParamsInput = z.infer<typeof bookIdParamsSchema>;