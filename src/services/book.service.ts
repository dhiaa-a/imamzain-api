// src/services/book.service.ts
import { prisma } from "../database/prisma";
import { 
  CreateBookRequest, 
  UpdateBookRequest, 
  GetBooksQuery,
  BookResponse,
  CreateBookTypeRequest,
  UpdateBookTypeRequest,
  BookTypeResponse
} from "../types/book.types";
import { generateSlug, generateUniqueSlug, isValidSlug } from "../utils/slug.utils";

export async function createBook(data: CreateBookRequest): Promise<BookResponse> {
  // Check if category exists
  const category = await prisma.bookType.findUnique({
    where: { id: data.categoryId }
  });
  
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  // Check if languages exist
  const languageCodes = data.translations.map(t => t.languageCode);
  const languages = await prisma.language.findMany({
    where: { code: { in: languageCodes } }
  });
  
  if (languages.length !== languageCodes.length) {
    throw new Error("INVALID_LANGUAGE_CODES");
  }

  // Ensure only one default translation
  const defaultTranslations = data.translations.filter(t => t.isDefault);
  if (defaultTranslations.length !== 1) {
    throw new Error("EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED");
  }

  // Generate slug if not provided
  let slug = data.slug;
  if (!slug) {
    const defaultTranslation = defaultTranslations[0];
    slug = generateSlug(defaultTranslation.title);
  } else {
    if (!isValidSlug(slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
  }

  // Ensure slug is unique
  const existingBooks = await prisma.book.findMany({
    select: { slug: true }
  });
  const existingSlugs = existingBooks.map(book => book.slug);
  const uniqueSlug = generateUniqueSlug(slug, existingSlugs);

  // If attachments are provided, verify they exist
  if (data.attachments && data.attachments.length > 0) {
    const attachmentIds = data.attachments.map(a => a.attachmentId);
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: attachmentIds } }
    });

    if (existingAttachments.length !== attachmentIds.length) {
      throw new Error("SOME_ATTACHMENTS_NOT_FOUND");
    }

    // Check for duplicate attachment IDs
    const duplicateIds = attachmentIds.filter((id, index) => attachmentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_IDS");
    }

    // Check for duplicate orders
    const orders = data.attachments.map(a => a.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_ORDERS");
    }
  }

  const book = await prisma.book.create({
    data: {
      slug: uniqueSlug,
      pages: data.pages,
      parts: data.parts,
      views: 0,
      partNumber: data.partNumber,
      totalParts: data.totalParts,
      categoryId: data.categoryId,
      translations: {
        create: data.translations.map(translation => ({
          languageCode: translation.languageCode,
          isDefault: translation.isDefault,
          title: translation.title,
          author: translation.author,
          printHouse: translation.printHouse,
          printDate: translation.printDate,
          series: translation.series,
          names: {
            create: (translation.names || []).map(name => ({ name }))
          }
        }))
      },
      ...(data.attachments && data.attachments.length > 0 && {
        attachments: {
          create: data.attachments.map(attachment => ({
            attachmentsId: attachment.attachmentId,
            type: attachment.type,
            order: attachment.order
          }))
        }
      })
    },
    include: {
      category: true,
      translations: {
        include: {
          language: true,
          names: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatBookResponse(book);
}

export async function getBookById(id: number, languageCode?: string): Promise<BookResponse | null> {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      translations: {
        where: languageCode ? { languageCode } : {},
        include: {
          language: true,
          names: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!book) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && book.translations.length === 0) {
    const bookWithDefault = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        translations: {
          where: { isDefault: true },
          include: {
            language: true,
            names: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return bookWithDefault ? formatBookResponse(bookWithDefault) : null;
  }

  return formatBookResponse(book);
}

export async function getBookBySlug(slug: string, languageCode?: string): Promise<BookResponse | null> {
  const book = await prisma.book.findFirst({
    where: { slug },
    include: {
      category: true,
      translations: {
        where: languageCode ? { languageCode } : {},
        include: {
          language: true,
          names: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!book) {
    return null;
  }

  // If no translations found for specific language, get default translation
  if (languageCode && book.translations.length === 0) {
    const bookWithDefault = await prisma.book.findFirst({
      where: { slug },
      include: {
        category: true,
        translations: {
          where: { isDefault: true },
          include: {
            language: true,
            names: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    return bookWithDefault ? formatBookResponse(bookWithDefault) : null;
  }

  // Increment views
  await prisma.book.update({
    where: { id: book.id },
    data: { views: { increment: 1 } }
  });

  return formatBookResponse(book);
}

export async function getBooks(query: GetBooksQuery = {}) {
  const { page = 1, limit = 10, categoryId, languageCode, search, author, series } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search || languageCode || author || series) {
    where.translations = {
      some: {
        ...(languageCode && { languageCode }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
            { series: { contains: search, mode: 'insensitive' } },
            { names: { some: { name: { contains: search, mode: 'insensitive' } } } }
          ]
        }),
        ...(author && { author: { contains: author, mode: 'insensitive' } }),
        ...(series && { series: { contains: series, mode: 'insensitive' } })
      }
    };
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        category: true,
        translations: {
          where: languageCode ? { languageCode } : { isDefault: true },
          include: {
            language: true,
            names: true
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.book.count({ where })
  ]);

  return {
    books: books.map(formatBookResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function updateBook(id: number, data: UpdateBookRequest): Promise<BookResponse> {
  const existingBook = await prisma.book.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingBook) {
    throw new Error("BOOK_NOT_FOUND");
  }

  // Handle slug update
  let slugToUpdate = data.slug;
  
  if (data.slug) {
    if (!isValidSlug(data.slug)) {
      throw new Error("INVALID_SLUG_FORMAT");
    }
    
    if (data.slug !== existingBook.slug) {
      const slugExists = await prisma.book.findFirst({
        where: { slug: data.slug, id: { not: id } }
      });
      if (slugExists) {
        const existingBooks = await prisma.book.findMany({
          where: { id: { not: id } },
          select: { slug: true }
        });
        const existingSlugs = existingBooks.map(book => book.slug);
        slugToUpdate = generateUniqueSlug(data.slug, existingSlugs);
      }
    }
  } else if (data.translations) {
    const defaultTranslation = data.translations.find(t => t.isDefault);
    if (defaultTranslation) {
      const newSlug = generateSlug(defaultTranslation.title);
      const existingBooks = await prisma.book.findMany({
        where: { id: { not: id } },
        select: { slug: true }
      });
      const existingSlugs = existingBooks.map(book => book.slug);
      slugToUpdate = generateUniqueSlug(newSlug, existingSlugs);
    }
  }

  // Validate translations if provided
  if (data.translations) {
    const languageCodes = data.translations.map(t => t.languageCode);
    const languages = await prisma.language.findMany({
      where: { code: { in: languageCodes } }
    });
    
    if (languages.length !== languageCodes.length) {
      throw new Error("INVALID_LANGUAGE_CODES");
    }

    const defaultTranslations = data.translations.filter(t => t.isDefault);
    if (defaultTranslations.length > 1) {
      throw new Error("ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED");
    }
  }

  // If attachments are provided, verify they exist
  if (data.attachments && data.attachments.length > 0) {
    const attachmentIds = data.attachments.map(a => a.attachmentId);
    const existingAttachments = await prisma.attachments.findMany({
      where: { id: { in: attachmentIds } }
    });

    if (existingAttachments.length !== attachmentIds.length) {
      throw new Error("SOME_ATTACHMENTS_NOT_FOUND");
    }

    const duplicateIds = attachmentIds.filter((id, index) => attachmentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_IDS");
    }

    const orders = data.attachments.map(a => a.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      throw new Error("DUPLICATE_ATTACHMENT_ORDERS");
    }
  }

  const updateData: any = {};
  
  if (slugToUpdate) updateData.slug = slugToUpdate;
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.parts !== undefined) updateData.parts = data.parts;
  if (data.partNumber !== undefined) updateData.partNumber = data.partNumber;
  if (data.totalParts !== undefined) updateData.totalParts = data.totalParts;
  if (data.categoryId) updateData.categoryId = data.categoryId;

  const book = await prisma.book.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      translations: {
        include: {
          language: true,
          names: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  // Update translations if provided
  if (data.translations) {
    // Delete existing translations and their names
    await prisma.bookTranslationName.deleteMany({
      where: { translation: { bookId: id } }
    });
    await prisma.bookTranslation.deleteMany({
      where: { bookId: id }
    });

    // Create new translations
    for (const translation of data.translations) {
      await prisma.bookTranslation.create({
        data: {
          bookId: id,
          languageCode: translation.languageCode,
          isDefault: translation.isDefault || false,
          title: translation.title,
          author: translation.author,
          printHouse: translation.printHouse,
          printDate: translation.printDate,
          series: translation.series,
          names: {
            create: (translation.names || []).map(name => ({ name }))
          }
        }
      });
    }
  }

  // Update attachments if provided
  if (data.attachments !== undefined) {
    await prisma.bookAttachments.deleteMany({
      where: { bookId: id }
    });

    if (data.attachments.length > 0) {
      await prisma.bookAttachments.createMany({
        data: data.attachments.map(attachment => ({
          bookId: id,
          attachmentsId: attachment.attachmentId,
          type: attachment.type,
          order: attachment.order
        }))
      });
    }
  }

  // Fetch updated book with all relations
  const updatedBook = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      translations: {
        include: {
          language: true,
          names: true
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return formatBookResponse(updatedBook!);
}

export async function deleteBook(id: number): Promise<void> {
  const book = await prisma.book.findUnique({
    where: { id }
  });

  if (!book) {
    throw new Error("BOOK_NOT_FOUND");
  }

  // Delete related records first to avoid foreign key constraint violations
  await prisma.bookTranslationName.deleteMany({
    where: { translation: { bookId: id } }
  });

  await prisma.bookTranslation.deleteMany({
    where: { bookId: id }
  });

  await prisma.bookAttachments.deleteMany({
    where: { bookId: id }
  });

  // Now delete the book itself
  await prisma.book.delete({
    where: { id }
  });
}

// Book Type (Category) functions
export async function createBookType(data: CreateBookTypeRequest): Promise<BookTypeResponse> {
  const existingType = await prisma.bookType.findUnique({
    where: { slug: data.slug }
  });

  if (existingType) {
    throw new Error("BOOK_TYPE_SLUG_EXISTS");
  }

  const bookType = await prisma.bookType.create({
    data: {
      slug: data.slug,
      name: data.name
    }
  });

  return formatBookTypeResponse(bookType);
}

export async function getBookTypes(): Promise<BookTypeResponse[]> {
  const bookTypes = await prisma.bookType.findMany({
    include: {
      _count: {
        select: { books: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return bookTypes.map(type => ({
    id: type.id,
    slug: type.slug,
    name: type.name,
    booksCount: type._count.books
  }));
}

export async function updateBookType(id: number, data: UpdateBookTypeRequest): Promise<BookTypeResponse> {
  const existingType = await prisma.bookType.findUnique({
    where: { id }
  });

  if (!existingType) {
    throw new Error("BOOK_TYPE_NOT_FOUND");
  }

  if (data.slug && data.slug !== existingType.slug) {
    const slugExists = await prisma.bookType.findUnique({
      where: { slug: data.slug }
    });
    if (slugExists) {
      throw new Error("BOOK_TYPE_SLUG_EXISTS");
    }
  }

  const bookType = await prisma.bookType.update({
    where: { id },
    data: {
      ...(data.slug && { slug: data.slug }),
      ...(data.name && { name: data.name })
    }
  });

  return formatBookTypeResponse(bookType);
}

export async function deleteBookType(id: number): Promise<void> {
  const bookType = await prisma.bookType.findUnique({
    where: { id },
    include: {
      _count: {
        select: { books: true }
      }
    }
  });

  if (!bookType) {
    throw new Error("BOOK_TYPE_NOT_FOUND");
  }

  if (bookType._count.books > 0) {
    throw new Error("BOOK_TYPE_HAS_BOOKS");
  }

  await prisma.bookType.delete({
    where: { id }
  });
}

function formatBookResponse(book: any): BookResponse {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://api.example.com' 
    : `http://localhost:${process.env.PORT || 8000}`;

  return {
    id: book.id,
    slug: book.slug,
    pages: book.pages,
    parts: book.parts,
    views: book.views,
    partNumber: book.partNumber,
    totalParts: book.totalParts,
    categoryId: book.categoryId,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    category: book.category,
    translations: book.translations.map((translation: any) => ({
      id: translation.id,
      bookId: translation.bookId,
      languageCode: translation.languageCode,
      isDefault: translation.isDefault,
      title: translation.title,
      author: translation.author,
      printHouse: translation.printHouse,
      printDate: translation.printDate,
      series: translation.series,
      names: translation.names.map((n: any) => n.name),
      language: translation.language
    })),
    attachments: book.attachments ? book.attachments.map((item: any) => ({
      id: item.id,
      bookId: item.bookId,
      attachmentId: item.attachmentsId,
      type: item.type,
      order: item.order,
      attachment: {
        id: item.attachment.id,
        originalName: item.attachment.originalName,
        fileName: item.attachment.fileName,
        path: item.attachment.path,
        mimeType: item.attachment.mimeType,
        size: item.attachment.size,
        disk: item.attachment.disk,
        collection: item.attachment.collection,
        altText: item.attachment.altText,
        metadata: item.attachment.metadata,
        createdAt: item.attachment.createdAt.toISOString(),
        updatedAt: item.attachment.updatedAt.toISOString(),
        url: `${baseUrl}/api/v1/attachments/uploads/${item.attachment.path}`
      }
    })) : []
  };
}

function formatBookTypeResponse(bookType: any): BookTypeResponse {
  return {
    id: bookType.id,
    slug: bookType.slug,
    name: bookType.name
  };
}