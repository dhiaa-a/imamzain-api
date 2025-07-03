import { z } from 'zod';

// Schema Validations
export const createTagSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2, 'Language code must be 2 characters'),
      isDefault: z.boolean(),
      name: z.string().min(1, 'Name is required')
    })).min(1, 'At least one translation is required')
  }),
  params: z.object({
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});

export const updateTagSchemaValidation = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2, 'Language code must be 2 characters'),
      isDefault: z.boolean(),
      name: z.string().min(1, 'Name is required')
    })).min(1, 'At least one translation is required').optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});

export const getTagsSchemaValidation = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional()
  }),
  params: z.object({
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});

export const getTagByIdSchemaValidation = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});

export const getTagBySlugSchemaValidation = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});

export const deleteTagSchemaValidation = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
    lang: z.string().length(2, 'Language code must be 2 characters')
  })
});