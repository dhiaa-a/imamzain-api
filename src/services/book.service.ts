// src/services/book.service.ts
import { prisma } from "../database/prisma"; 
import { generateSlug } from '../utils/slug.utils';
import type { 
  CreateBookRequest, 
  UpdateBookRequest, 
  BookQuery, 
  BookResponse,
  BookWithTranslations 
} from '../types/book.types';

export const getAllBooks = async (query: BookQuery, languageCode: string): Promise<{
  books: BookResponse[];
  total: number;
}> => {
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
      include: {
        translations: {
          where: {
            languageCode
          }
        },
        category: {
          include: {
            translations: {
              where: {
                languageCode
              }
            }
          }
        },
        attachments: {
          include: {
            attachment: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: query.limit || 10,
      skip: query.offset || 0
    }),
    prisma.book.count({ where })
  ]);

  const formattedBooks: BookResponse[] = books.map(book => {
    const translation = book.translations[0];
    const categoryTranslation = book.category.translations[0];

    return {
      id: book.id,
      slug: book.slug,
      isbn: book.isbn,
      pages: book.pages,
      parts: book.parts,
      views: book.views,
      partNumber: book.partNumber,
      totalParts: book.totalParts,
      publishYear: book.publishYear,
      isPublished: book.isPublished,
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
      attachments: book.attachments.map(att => ({
        id: att.id,
        type: att.type,
        order: att.order,
        caption: att.caption,
        attachment: {
          id: att.attachment.id,
          originalName: att.attachment.originalName,
          fileName: att.attachment.fileName,
          path: att.attachment.path,
          mimeType: att.attachment.mimeType,
          size: att.attachment.size,
          altText: att.attachment.altText
        }
      }))
    };
  });

  return {
    books: formattedBooks,
    total
  };
};

export const getBookBySlug = async (slug: string, languageCode: string): Promise<BookResponse | null> => {
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      translations: {
        where: {
          languageCode
        }
      },
      category: {
        include: {
          translations: {
            where: {
              languageCode
            }
          }
        }
      },
      attachments: {
        include: {
          attachment: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!book || book.translations.length === 0) {
    return null;
  }

  // Increment views
  await prisma.book.update({
    where: { id: book.id },
    data: { views: { increment: 1 } }
  });

  const translation = book.translations[0];
  const categoryTranslation = book.category.translations[0];

  return {
    id: book.id,
    slug: book.slug,
    isbn: book.isbn,
    pages: book.pages,
    parts: book.parts,
    views: book.views + 1,
    partNumber: book.partNumber,
    totalParts: book.totalParts,
    publishYear: book.publishYear,
    isPublished: book.isPublished,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
    title: translation.title,
    author: translation.author,
    publisher: translation.publisher,
    description: translation.description,
    series: translation.series,
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    category: {
      id: book.category.id,
      slug: book.category.slug,
      name: categoryTranslation?.name || ''
    },
    attachments: book.attachments.map(att => ({
      id: att.id,
      type: att.type,
      order: att.order,
      caption: att.caption,
      attachment: {
        id: att.attachment.id,
        originalName: att.attachment.originalName,
        fileName: att.attachment.fileName,
        path: att.attachment.path,
        mimeType: att.attachment.mimeType,
        size: att.attachment.size,
        altText: att.attachment.altText
      }
    }))
  };
};

export const createBook = async (bookData: CreateBookRequest): Promise<BookWithTranslations> => {
  // Generate slug from the default translation title
  const defaultTranslation = bookData.translations.find(t => t.isDefault) || bookData.translations[0];
  const slug = await generateSlug(defaultTranslation.title, 'book');

  const book = await prisma.book.create({
    data: {
      slug,
      isbn: bookData.isbn,
      pages: bookData.pages,
      parts: bookData.parts,
      partNumber: bookData.partNumber,
      totalParts: bookData.totalParts,
      publishYear: bookData.publishYear,
      isPublished: bookData.isPublished || false,
      categoryId: bookData.categoryId,
      translations: {
        create: bookData.translations
      }
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      attachments: {
        include: {
          attachment: true
        }
      }
    }
  });

  return book;
};

export const updateBook = async (id: number, bookData: UpdateBookRequest): Promise<BookWithTranslations | null> => {
  const existingBook = await prisma.book.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!existingBook) {
    return null;
  }

  let slug = existingBook.slug;

  // If translations are being updated and there's a default one, regenerate slug
  if (bookData.translations) {
    const defaultTranslation = bookData.translations.find(t => t.isDefault) || bookData.translations[0];
    if (defaultTranslation) {
      slug = await generateSlug(defaultTranslation.title, 'book', id);
    }
  }

  const updateData: any = {
    slug,
    ...(bookData.isbn !== undefined && { isbn: bookData.isbn }),
    ...(bookData.pages !== undefined && { pages: bookData.pages }),
    ...(bookData.parts !== undefined && { parts: bookData.parts }),
    ...(bookData.partNumber !== undefined && { partNumber: bookData.partNumber }),
    ...(bookData.totalParts !== undefined && { totalParts: bookData.totalParts }),
    ...(bookData.publishYear !== undefined && { publishYear: bookData.publishYear }),
    ...(bookData.isPublished !== undefined && { isPublished: bookData.isPublished }),
    ...(bookData.categoryId !== undefined && { categoryId: bookData.categoryId })
  };

  // Handle translations update
  if (bookData.translations) {
    // Delete existing translations
    await prisma.bookTranslation.deleteMany({
      where: { bookId: id }
    });

    updateData.translations = {
      create: bookData.translations
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
      attachments: {
        include: {
          attachment: true
        }
      }
    }
  });

  return updatedBook;
};

export const deleteBook = async (id: number): Promise<boolean> => {
  try {
    await prisma.book.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const checkBookExists = async (id: number): Promise<boolean> => {
  const book = await prisma.book.findUnique({
    where: { id }
  });
  return !!book;
};