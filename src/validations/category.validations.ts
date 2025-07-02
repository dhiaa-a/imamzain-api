import { z } from 'zod';
import { ModelType } from '@prisma/client';

const categoryTranslationSchema = z.object({
  languageCode: z.string().min(2).max(5),
  isDefault: z.boolean().default(false),
  name: z.string().min(1).max(255).trim(),
});

export const createCategorySchema = z.object({
  body: z.object({
    slug: z.string().min(1).max(255).trim().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    model: z.nativeEnum(ModelType),
    isActive: z.boolean().default(true),
    translations: z.array(categoryTranslationSchema).min(1, 'At least one translation is required')
      .refine(
        (translations) => translations.filter(t => t.isDefault).length === 1,
        'Exactly one translation must be marked as default'
      ),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),
  body: z.object({
    slug: z.string().min(1).max(255).trim().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    model: z.nativeEnum(ModelType).optional(),
    isActive: z.boolean().optional(),
    translations: z.array(categoryTranslationSchema).min(1, 'At least one translation is required')
      .refine(
        (translations) => translations.filter(t => t.isDefault).length === 1,
        'Exactly one translation must be marked as default'
      ).optional(),
  }),
});

export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),
});

export const getCategoriesSchema = z.object({
  query: z.object({
    model: z.nativeEnum(ModelType).optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
    search: z.string().min(1).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),
});