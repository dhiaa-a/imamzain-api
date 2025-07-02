import { z } from 'zod';

export const createTagSchema = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2, 'Language code must be 2 characters'),
      isDefault: z.boolean(),
      name: z.string().min(1, 'Name is required')
    })).min(1, 'At least one translation is required')
  })
});

export const updateTagSchema = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2, 'Language code must be 2 characters'),
      isDefault: z.boolean(),
      name: z.string().min(1, 'Name is required')
    })).min(1, 'At least one translation is required').optional()
  })
});

export const getTagsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional()
  })
});

export const tagParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});