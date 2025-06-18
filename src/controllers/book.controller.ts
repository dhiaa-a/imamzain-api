// src/controllers/book.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createBook,
  getBookById,
  getBookBySlug,
  getBooks,
  updateBook,
  deleteBook,
  createBookType,
  getBookTypes,
  updateBookType,
  deleteBookType
} from "../services/book.service";
import { CreateBookRequest, UpdateBookRequest, CreateBookTypeRequest, UpdateBookTypeRequest } from "../types/book.types";

export async function createBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookData: CreateBookRequest = req.body;
    const { lang } = req.params;
    
    // Basic validation
    if (!bookData.pages || !bookData.parts || !bookData.partNumber || !bookData.totalParts || !bookData.categoryId || !bookData.translations) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required fields: pages, parts, partNumber, totalParts, categoryId, translations"
        }
      });
      return;
    }

    if (!Array.isArray(bookData.translations) || bookData.translations.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "At least one translation is required"
        }
      });
      return;
    }

    const book = await createBook(bookData);
    
    res.status(201).json({
      success: true,
      data: book,
      message: `Book created with auto-generated slug: ${book.slug}`
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book category not found"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_LANGUAGE_CODES") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more language codes are invalid"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_SLUG_FORMAT") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens"
        }
      });
      return;
    }
    
    if (error.message === "EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Exactly one translation must be marked as default"
        }
      });
      return;
    }

    if (error.message === "SOME_ATTACHMENTS_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Some attachment IDs do not exist"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment IDs found"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_ORDERS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment order values found"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function getBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const bookId = parseInt(id);
    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid book ID"
        }
      });
      return;
    }

    const book = await getBookById(bookId, lang);
    
    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, lang } = req.params;

    const book = await getBookBySlug(slug, lang);
    
    if (!book) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
}

export async function getBooksHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lang } = req.params;
    const {
      page = "1",
      limit = "10",
      categoryId,
      search,
      author,
      series
    } = req.query;

    const query = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      languageCode: lang,
      search: search as string,
      author: author as string,
      series: series as string
    };

    const result = await getBooks(query);
    
    res.json({
      success: true,
      data: result.books,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    const updateData: UpdateBookRequest = req.body;
    
    const bookId = parseInt(id);
    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid book ID"
        }
      });
      return;
    }

    const book = await updateBook(bookId, updateData);
    
    res.json({
      success: true,
      data: book
    });
  } catch (error: any) {
    if (error.message === "BOOK_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book not found"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_SLUG_FORMAT") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_LANGUAGE_CODES") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more language codes are invalid"
        }
      });
      return;
    }
    
    if (error.message === "ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Only one translation can be marked as default"
        }
      });
      return;
    }

    if (error.message === "SOME_ATTACHMENTS_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Some attachment IDs do not exist"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment IDs found"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_ORDERS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment order values found"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function deleteBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const bookId = parseInt(id);
    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid book ID"
        }
      });
      return;
    }

    await deleteBook(bookId);
    
    res.json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "BOOK_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book not found"
        }
      });
      return;
    }
    
    next(error);
  }
}

// Book Type (Category) handlers
export async function createBookTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const typeData: CreateBookTypeRequest = req.body;
    
    if (!typeData.slug || !typeData.name) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required fields: slug, name"
        }
      });
      return;
    }

    const bookType = await createBookType(typeData);
    
    res.status(201).json({
      success: true,
      data: bookType
    });
  } catch (error: any) {
    if (error.message === "BOOK_TYPE_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Book type with this slug already exists"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function getBookTypesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookTypes = await getBookTypes();
    
    res.json({
      success: true,
      data: bookTypes
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: UpdateBookTypeRequest = req.body;
    
    const typeId = parseInt(id);
    if (isNaN(typeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid book type ID"
        }
      });
      return;
    }

    const bookType = await updateBookType(typeId, updateData);
    
    res.json({
      success: true,
      data: bookType
    });
  } catch (error: any) {
    if (error.message === "BOOK_TYPE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book type not found"
        }
      });
      return;
    }
    
    if (error.message === "BOOK_TYPE_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Book type with this slug already exists"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function deleteBookTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    const typeId = parseInt(id);
    if (isNaN(typeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid book type ID"
        }
      });
      return;
    }

    await deleteBookType(typeId);
    
    res.json({
      success: true,
      message: "Book type deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "BOOK_TYPE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book type not found"
        }
      });
      return;
    }
    
    if (error.message === "BOOK_TYPE_HAS_BOOKS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Cannot delete book type as it contains books"
        }
      });
      return;
    }
    
    next(error);
  }
}