import { z } from 'zod';

export const createArticleSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean(),
      title: z.string().min(1).max(255),
      summary: z.string().max(500).optional(),
      body: z.string().min(1)
    })).min(1),
    categoryId: z.number().int().positive(),
    tagIds: z.array(z.number().int().positive()).optional(),
    attachmentIds: z.array(z.number().int().positive()).optional(),
    mainImageId: z.number().int().positive().optional(), // New field for main image
    publishedAt: z.string().datetime().optional(),
    isPublished: z.boolean().optional()
  }),
  params: z.object({
    lang: z.string().length(2)
  })
});

export const updateArticleSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean(),
      title: z.string().min(1).max(255),
      summary: z.string().max(500).optional(),
      body: z.string().min(1)
    })).min(1).optional(),
    categoryId: z.number().int().positive().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
    attachmentIds: z.array(z.number().int().positive()).optional(),
    mainImageId: z.number().int().positive().optional(), // New field for main image
    publishedAt: z.string().datetime().optional(),
    isPublished: z.boolean().optional()
  }),
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getArticleSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getArticleBySlugSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    slug: z.string().min(1)
  })
});

export const getArticlesSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2)
  }),
  query: z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => parseInt(val) || 10).optional(),
    categoryId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
    tagIds: z.string().transform(val => val.split(',').map(id => parseInt(id))).optional(),
    isPublished: z.string().transform(val => val === 'true').optional(),
    search: z.string().optional()
  })
});

export const deleteArticleSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});