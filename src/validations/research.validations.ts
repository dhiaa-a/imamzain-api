import { z } from 'zod';

export const createResearchSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean(),
      title: z.string().min(1).max(500),
      abstract: z.string().max(2000).optional(),
      authors: z.string().max(500).optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional()
    })).min(1),
    categoryId: z.number().int().positive(),
    tagIds: z.array(z.number().int().positive()).optional(),
    attachmentIds: z.array(z.number().int().positive()).optional(),
    publishedAt: z.string().transform(val => new Date(val)).optional(),
    pages: z.number().int().positive().optional(),
    isPublished: z.boolean().optional()
  }),
  params: z.object({
    lang: z.string().length(2)
  })
});

export const updateResearchSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean(),
      title: z.string().min(1).max(500),
      abstract: z.string().max(2000).optional(),
      authors: z.string().max(500).optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional()
    })).min(1).optional(),
    categoryId: z.number().int().positive().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
    attachmentIds: z.array(z.number().int().positive()).optional(),
    publishedAt: z.string().transform(val => new Date(val)).optional(),
    pages: z.number().int().positive().optional(),
    isPublished: z.boolean().optional()
  }),
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getResearchSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getResearchBySlugSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    slug: z.string().min(1)
  })
});

export const getResearchesSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2)
  }),
  query: z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => parseInt(val) || 10).optional(),
    categoryId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
    tagIds: z.string().transform(val => val.split(',').map(id => parseInt(id))).optional(),
    search: z.string().optional(),
    isPublished: z.string().transform(val => val === 'true').optional(),
    publishedYear: z.string().optional()
  })
});

export const deleteResearchSchemaValidation = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});