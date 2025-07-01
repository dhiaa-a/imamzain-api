import { z } from 'zod';

const articleCategoryTranslationSchema = z.object({
  id: z.number().optional(),
  languageCode: z.string().min(2).max(5),
  isDefault: z.boolean(),
  name: z.string().min(1).max(255),
});

export const createArticleCategorySchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  parentId: z.number().positive().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  translations: z.array(articleCategoryTranslationSchema).min(1),
});

export const updateArticleCategorySchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  parentId: z.number().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  translations: z.array(articleCategoryTranslationSchema).optional(),
});

export const articleCategoryIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0, 'ID must be a positive number'),
});

export const articleCategorySlugSchema = z.object({
  slug: z.string().min(1).max(255),
});

export const articleCategoryQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100).default('10'),
  parentId: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0).optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  languageCode: z.string().min(2).max(5).optional(),
  search: z.string().optional(),
});