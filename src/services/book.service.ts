import { prisma } from "../database/prisma"; 
import { generateSlug, generateUniqueSlug } from '../utils/slug.utils';
import type { 
  CreateBookRequest, 
  UpdateBookRequest, 
  BookQuery, 
  BookResponse,
  BookWithTranslations,
  CreateBookCategoryRequest,
  UpdateBookCategoryRequest
} from '../types/book.types';

export const createBook = async (data: CreateBookRequest): Promise<BookResponse> => {
  // Validate that category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId, model: 'BOOK' }
  });
  
  if (!categoryExists) {
    throw new Error(`Book category with ID ${data.categoryId} does not exist`);
  }

  // Validate that all tags exist if provided
  if (data.tagIds && data.tagIds.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } }
    });
    
    if (existingTags.length !== data.tagIds.length) {
      const existingTagIds = existingTags.map(tag => tag.id);
      const missingTagIds = data.tagIds.filter(id => !existingTagIds.includes(id));
      throw new Error(`Tags with IDs ${missingTagIds.join(', ')} do not exist`);
    }
  }

  // Validate cover exists if provided
  if (data.coverId) {
    const coverExists = await prisma.attachments.findUnique({
      where: { id: data.coverId }
    });
    
    if (!coverExists) {
      throw new Error(`Cover attachment with ID ${data.coverId} does not exist`);
    }
  }

  // Validate file exists if provided
  if (data.fileId) {
    const fileExists = await prisma.attachments.findUnique({
      where: { id: data.fileId }
    });
    
    if (!fileExists) {
      throw new Error(`File attachment with ID ${data.fileId} does not exist`);
    }
  }

  // Validate parent book exists if provided
  if (data.parentBookId) {
    const parentBookExists = await prisma.book.findUnique({
      where: { id: data.parentBookId }
    });
    
    if (!parentBookExists) {
      throw new Error(`Parent book with ID ${data.parentBookId} does not exist`);
    }
  }

  // Generate unique slug
  const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
  const baseSlug = generateSlug(defaultTranslation.title);
  
  // Get all existing book slugs to ensure uniqueness
  const existingBooks = await prisma.book.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingBooks.map(book => book.slug);
  
  // Generate unique slug
  const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
  
  const book = await prisma.book.create({
    data: {
      slug: uniqueSlug,
      isbn: data.isbn,
      pages: data.pages,
      partNumber: data.partNumber,
      totalParts: data.totalParts,
      publishYear: data.publishYear,
      isPublished: data.isPublished || false,
      categoryId: data.categoryId,
      coverId: data.coverId,
      fileId: data.fileId,
      parentBookId: data.parentBookId,
      translations: {
        create: data.translations
      },
      tags: data.tagIds ? {
        create: data.tagIds.map(tagId => ({ tagId }))
      } : undefined
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      cover: true,
      file: true,
      parentBook: {
        include: {
          translations: true
        }
      },
      parts: {
        include: {
          translations: true
        },
        orderBy: {
          partNumber: 'asc'
        }
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  });

  return formatBookResponse(book);
};

export const getBooks = async (query: BookQuery, lang: string): Promise<{
  books: BookResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const page = Math.max(1, Math.floor((query.offset || 0) / (query.limit || 10)) + 1);
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished;
  }

  if (query.publishYear) {
    where.publishYear = query.publishYear;
  }

  if (query.parentBookId !== undefined) {
    where.parentBookId = query.parentBookId;
  }

  if (query.hasParent !== undefined) {
    where.parentBookId = query.hasParent ? { not: null } : null;
  }

  if (query.tagIds && query.tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: query.tagIds
        }
      }
    };
  }

  if (query.search) {
    where.translations = {
      some: {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { author: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } }
        ]
      }
    };
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      include: {
        translations: true,
        category: {
          include: {
            translations: true
          }
        },
        cover: true,
        file: true,
        parentBook: {
          include: {
            translations: true
          }
        },
        parts: {
          include: {
            translations: true
          },
          orderBy: {
            partNumber: 'asc'
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.book.count({ where })
  ]);

  return {
    books: books.map(book => formatBookResponse(book, lang)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getBookById = async (id: number, lang: string): Promise<BookResponse | null> => {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      cover: true,
      file: true,
      parentBook: {
        include: {
          translations: true
        }
      },
      parts: {
        include: {
          translations: true
        },
        orderBy: {
          partNumber: 'asc'
        }
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  });

  if (!book) return null;

  // Increment view count
  await prisma.book.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  return formatBookResponse(book, lang);
};

export const getBookBySlug = async (slug: string, lang: string): Promise<BookResponse | null> => {
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      cover: true,
      file: true,
      parentBook: {
        include: {
          translations: true
        }
      },
      parts: {
        include: {
          translations: true
        },
        orderBy: {
          partNumber: 'asc'
        }
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  });

  if (!book) return null;

  // Increment view count
  await prisma.book.update({
    where: { slug },
    data: { views: { increment: 1 } }
  });

  return formatBookResponse(book, lang);
};

export const updateBook = async (id: number, data: UpdateBookRequest): Promise<BookResponse | null> => {
  const existingBook = await prisma.book.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingBook) return null;

  // Validate category if provided
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId, model: 'BOOK' }
    });
    
    if (!categoryExists) {
      throw new Error(`Book category with ID ${data.categoryId} does not exist`);
    }
  }

  // Validate tags if provided
  if (data.tagIds && data.tagIds.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } }
    });
    
    if (existingTags.length !== data.tagIds.length) {
      const existingTagIds = existingTags.map(tag => tag.id);
      const missingTagIds = data.tagIds.filter(id => !existingTagIds.includes(id));
      throw new Error(`Tags with IDs ${missingTagIds.join(', ')} do not exist`);
    }
  }

  // Validate cover if provided
  if (data.coverId) {
    const coverExists = await prisma.attachments.findUnique({
      where: { id: data.coverId }
    });
    
    if (!coverExists) {
      throw new Error(`Cover attachment with ID ${data.coverId} does not exist`);
    }
  }

  // Validate file if provided
  if (data.fileId) {
    const fileExists = await prisma.attachments.findUnique({
      where: { id: data.fileId }
    });
    
    if (!fileExists) {
      throw new Error(`File attachment with ID ${data.fileId} does not exist`);
    }
  }

  // Validate parent book if provided (and not setting self as parent)
  if (data.parentBookId) {
    if (data.parentBookId === id) {
      throw new Error('Book cannot be its own parent');
    }
    
    const parentBookExists = await prisma.book.findUnique({
      where: { id: data.parentBookId }
    });
    
    if (!parentBookExists) {
      throw new Error(`Parent book with ID ${data.parentBookId} does not exist`);
    }
  }

  let updateData: any = {};

  // Update basic fields
  if (data.isbn !== undefined) updateData.isbn = data.isbn;
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.partNumber !== undefined) updateData.partNumber = data.partNumber;
  if (data.totalParts !== undefined) updateData.totalParts = data.totalParts;
  if (data.publishYear !== undefined) updateData.publishYear = data.publishYear;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.coverId !== undefined) updateData.coverId = data.coverId;
  if (data.fileId !== undefined) updateData.fileId = data.fileId;
  if (data.parentBookId !== undefined) updateData.parentBookId = data.parentBookId;

  // Handle slug update if title changed
  if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    const currentDefaultTranslation = existingBook.translations.find(t => t.isDefault);
    
    if (currentDefaultTranslation && defaultTranslation.title !== currentDefaultTranslation.title) {
      // Generate new unique slug
      const baseSlug = generateSlug(defaultTranslation.title);
      
      // Get all existing book slugs except the current one
      const existingBooks = await prisma.book.findMany({
        select: { slug: true },
        where: { id: { not: id } }
      });
      const existingSlugs = existingBooks.map(book => book.slug);
      
      // Generate unique slug
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      updateData.slug = uniqueSlug;
    }

    updateData.translations = {
      deleteMany: {},
      create: data.translations
    };
  }

  // Handle tags update
  if (data.tagIds !== undefined) {
    updateData.tags = {
      deleteMany: {},
      create: data.tagIds.map(tagId => ({ tagId }))
    };
  }

  const updatedBook = await prisma.book.update({
    where: { id },
    data: updateData,
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      cover: true,
      file: true,
      parentBook: {
        include: {
          translations: true
        }
      },
      parts: {
        include: {
          translations: true
        },
        orderBy: {
          partNumber: 'asc'
        }
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: true
            }
          }
        }
      }
    }
  });

  return formatBookResponse(updatedBook);
};

export const deleteBook = async (id: number): Promise<boolean> => {
  try {
    // Check if book has parts
    const partsCount = await prisma.book.count({
      where: { parentBookId: id }
    });

    if (partsCount > 0) {
      throw new Error('Cannot delete book that has parts. Delete parts first.');
    }

    await prisma.book.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Book Category services
export const createBookCategory = async (data: CreateBookCategoryRequest): Promise<any> => {
  const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
  const baseSlug = generateSlug(defaultTranslation.name);
  
  const existingCategories = await prisma.category.findMany({
    select: { slug: true },
    where: { model: 'BOOK' }
  });
  const existingSlugs = existingCategories.map(cat => cat.slug);
  const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
  
  const category = await prisma.category.create({
    data: {
      slug: uniqueSlug,
      model: 'BOOK',
      translations: {
        create: data.translations
      }
    },
    include: {
      translations: true
    }
  });

  return category;
};

export const getBookCategories = async (lang?: string): Promise<any[]> => {
  const categories = await prisma.category.findMany({
    where: { 
      model: 'BOOK',
      isActive: true 
    },
    include: {
      translations: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return categories.map(category => {
    const translation = lang 
      ? category.translations.find(t => t.languageCode === lang) || category.translations.find(t => t.isDefault)
      : category.translations.find(t => t.isDefault);

    return {
      id: category.id,
      slug: category.slug,
      name: translation?.name || '',
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  });
};

export const getBookCategoryById = async (id: number, lang?: string): Promise<any | null> => {
  const category = await prisma.category.findUnique({
    where: { 
      id,
      model: 'BOOK'
    },
    include: {
      translations: true
    }
  });

  if (!category) return null;

  const translation = lang 
    ? category.translations.find(t => t.languageCode === lang) || category.translations.find(t => t.isDefault)
    : category.translations.find(t => t.isDefault);

  return {
    id: category.id,
    slug: category.slug,
    name: translation?.name || '',
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};

export const getBookCategoryBySlug = async (slug: string, lang?: string): Promise<any | null> => {
  const category = await prisma.category.findUnique({
    where: { 
      slug,
      model: 'BOOK'
    },
    include: {
      translations: true
    }
  });

  if (!category) return null;

  const translation = lang 
    ? category.translations.find(t => t.languageCode === lang) || category.translations.find(t => t.isDefault)
    : category.translations.find(t => t.isDefault);

  return {
    id: category.id,
    slug: category.slug,
    name: translation?.name || '',
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};

export const updateBookCategory = async (id: number, data: UpdateBookCategoryRequest): Promise<any | null> => {
  const existingCategory = await prisma.category.findUnique({
    where: { 
      id,
      model: 'BOOK'
    },
    include: { translations: true }
  });

  if (!existingCategory) return null;

  let updateData: any = {};

  // Handle slug update if name changed
  if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault) || data.translations[0];
    const currentDefaultTranslation = existingCategory.translations.find(t => t.isDefault);
    
    if (currentDefaultTranslation && defaultTranslation.name !== currentDefaultTranslation.name) {
      // Generate new unique slug
      const baseSlug = generateSlug(defaultTranslation.name);
      
      // Get all existing category slugs except the current one
      const existingCategories = await prisma.category.findMany({
        select: { slug: true },
        where: { 
          id: { not: id },
          model: 'BOOK'
        }
      });
      const existingSlugs = existingCategories.map(cat => cat.slug);
      
      // Generate unique slug
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
      updateData.slug = uniqueSlug;
    }

    updateData.translations = {
      deleteMany: {},
      create: data.translations
    };
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      translations: true
    }
  });

  return updatedCategory;
};

export const deleteBookCategory = async (id: number): Promise<boolean> => {
  try {
    // Check if category has books
    const booksCount = await prisma.book.count({
      where: { categoryId: id }
    });

    if (booksCount > 0) {
      throw new Error('Cannot delete category that has books');
    }

    await prisma.category.delete({
      where: { 
        id,
        model: 'BOOK'
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to format book response
const formatBookResponse = (book: any, lang?: string): BookResponse => {
  const translation = lang 
    ? book.translations.find((t: any) => t.languageCode === lang) || book.translations.find((t: any) => t.isDefault)
    : book.translations.find((t: any) => t.isDefault);

  const categoryTranslation = lang 
    ? book.category.translations.find((t: any) => t.languageCode === lang) || book.category.translations.find((t: any) => t.isDefault)
    : book.category.translations.find((t: any) => t.isDefault);

  const parentBookTranslation = book.parentBook && lang
    ? book.parentBook.translations.find((t: any) => t.languageCode === lang) || book.parentBook.translations.find((t: any) => t.isDefault)
    : book.parentBook?.translations.find((t: any) => t.isDefault);

  return {
    id: book.id,
    slug: book.slug,
    isbn: book.isbn,
    pages: book.pages,
    views: book.views,
    partNumber: book.partNumber,
    totalParts: book.totalParts,
    publishYear: book.publishYear,
    isPublished: book.isPublished,
    categoryId: book.categoryId,
    coverId: book.coverId,
    fileId: book.fileId,
    parentBookId: book.parentBookId,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
    title: translation?.title || '',
    author: translation?.author,
    publisher: translation?.publisher,
    description: translation?.description,
    series: translation?.series,
    metaTitle: translation?.metaTitle,
    metaDescription: translation?.metaDescription,
    category: {
      id: book.category.id,
      slug: book.category.slug,
      name: categoryTranslation?.name || ''
    },
    cover: book.cover ? {
      id: book.cover.id,
      originalName: book.cover.originalName,
      fileName: book.cover.fileName,
      path: book.cover.path,
      mimeType: book.cover.mimeType,
      size: book.cover.size,
      altText: book.cover.altText
    } : undefined,
    file: book.file ? {
      id: book.file.id,
      originalName: book.file.originalName,
      fileName: book.file.fileName,
      path: book.file.path,
      mimeType: book.file.mimeType,
      size: book.file.size,
      altText: book.file.altText
    } : undefined,
    parentBook: book.parentBook ? {
      id: book.parentBook.id,
      slug: book.parentBook.slug,
      title: parentBookTranslation?.title || ''
    } : undefined,
    parts: book.parts?.map((part: any) => {
      const partTranslation = lang 
        ? part.translations.find((t: any) => t.languageCode === lang) || part.translations.find((t: any) => t.isDefault)
        : part.translations.find((t: any) => t.isDefault);
      
      return {
        id: part.id,
        slug: part.slug,
        title: partTranslation?.title || '',
        partNumber: part.partNumber
      };
    }),
    tags: book.tags?.map((bookTag: any) => {
      const tagTranslation = lang 
        ? bookTag.tag.translations.find((t: any) => t.languageCode === lang) || bookTag.tag.translations.find((t: any) => t.isDefault)
        : bookTag.tag.translations.find((t: any) => t.isDefault);
      
      return {
        id: bookTag.tag.id,
        slug: bookTag.tag.slug,
        name: tagTranslation?.name || ''
      };
    })
  };
};