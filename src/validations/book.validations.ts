import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    isbn: z.string().optional(),
    pages: z.number().int().positive().optional(),
    partNumber: z.number().int().positive().optional(),
    totalParts: z.number().int().positive().optional(),
    publishYear: z.string().optional(),
    isPublished: z.boolean().optional().default(false),
    categoryId: z.number().int().positive(),
    coverId: z.number().int().positive().optional(),      // New field for cover
    fileId: z.number().int().positive().optional(),       // New field for file
    parentBookId: z.number().int().positive().optional(), // New field for parent book
    tagIds: z.array(z.number().int().positive()).optional(), // New field for tags
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean().optional().default(false),
      title: z.string().min(1).max(500),
      author: z.string().max(300).optional(),
      publisher: z.string().max(300).optional(),
      description: z.string().optional(),
      series: z.string().max(300).optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional()
    })).min(1)
  }),
  params: z.object({
    lang: z.string().length(2)
  })
});

export const updateBookSchema = z.object({
  body: z.object({
    isbn: z.string().optional(),
    pages: z.number().int().positive().optional(),
    partNumber: z.number().int().positive().optional(),
    totalParts: z.number().int().positive().optional(),
    publishYear: z.string().optional(),
    isPublished: z.boolean().optional(),
    categoryId: z.number().int().positive().optional(),
    coverId: z.number().int().positive().optional(),      // New field for cover
    fileId: z.number().int().positive().optional(),       // New field for file
    parentBookId: z.number().int().positive().optional(), // New field for parent book
    tagIds: z.array(z.number().int().positive()).optional(), // New field for tags
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean().optional().default(false),
      title: z.string().min(1).max(500),
      author: z.string().max(300).optional(),
      publisher: z.string().max(300).optional(),
      description: z.string().optional(),
      series: z.string().max(300).optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional()
    })).optional()
  }),
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getBookSchema = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getBookBySlugSchema = z.object({
  params: z.object({
    lang: z.string().length(2),
    slug: z.string().min(1)
  })
});

export const getBooksSchema = z.object({
  params: z.object({
    lang: z.string().length(2)
  }),
  query: z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => parseInt(val) || 10).optional(),
    categoryId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
    isPublished: z.string().transform(val => val === 'true').optional(),
    publishYear: z.string().optional(),
    parentBookId: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
    hasParent: z.string().transform(val => val === 'true').optional(),
    tagIds: z.string().transform(val => val.split(',').map(id => parseInt(id))).optional(),
    search: z.string().max(100).optional()
  })
});

export const deleteBookSchema = z.object({
  params: z.object({
    lang: z.string().length(2),
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

// Book Category validations
export const createBookCategorySchema = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean().optional().default(false),
      name: z.string().min(1).max(255)
    })).min(1)
  })
});

export const updateBookCategorySchema = z.object({
  body: z.object({
    translations: z.array(z.object({
      languageCode: z.string().length(2),
      isDefault: z.boolean().optional().default(false),
      name: z.string().min(1).max(255)
    })).optional()
  }),
  params: z.object({
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getBookCategorySchema = z.object({
  params: z.object({
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

export const getBookCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1)
  })
});

export const deleteBookCategorySchema = z.object({
  params: z.object({
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0)
  })
});

// Validation middleware functions
export const validateCreateBook = (req: any, res: any, next: any) => {
  const result = createBookSchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  next();
};

export const validateUpdateBook = (req: any, res: any, next: any) => {
  const result = updateBookSchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  next();
};

export const validateCreateBookCategory = (req: any, res: any, next: any) => {
  const result = createBookCategorySchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  next();
};

export const validateUpdateBookCategory = (req: any, res: any, next: any) => {
  const result = updateBookCategorySchema.safeParse(req);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  next();
};