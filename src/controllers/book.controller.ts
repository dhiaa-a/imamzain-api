// src/controllers/book.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createBook,
  getBookById,
  getBookBySlug,
  getBooks,
  updateBook,
  deleteBook,
  createBookCategory,
  getBookCategories,
  getBookCategoryById,
  getBookCategoryBySlug,
  updateBookCategory,
  deleteBookCategory
} from "../services/book.service";
import { CreateBookRequest, UpdateBookRequest, CreateBookCategoryRequest, UpdateBookCategoryRequest } from "../types/book.types";

export async function createBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookData: CreateBookRequest = req.body;
    const { lang } = req.params;
    
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

// Book Category handlers
export async function createBookCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoryData: CreateBookCategoryRequest = req.body;
    
    const bookCategory = await createBookCategory(categoryData);
    
    res.status(201).json({
      success: true,
      data: bookCategory
    });
  } catch (error: any) {
    if (error.message === "PARENT_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Parent category not found"
        }
      });
      return;
    }

    if (error.message === "BOOK_CATEGORY_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Book category with this slug already exists"
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
    
    next(error);
  }
}

export async function getBookCategoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lang } = req.params;
    
    const bookCategories = await getBookCategories(lang);
    
    res.json({
      success: true,
      data: bookCategories
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid category ID"
        }
      });
      return;
    }

    const category = await getBookCategoryById(categoryId, lang);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book category not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookCategoryBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, lang } = req.params;

    const category = await getBookCategoryBySlug(slug, lang);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book category not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: UpdateBookCategoryRequest = req.body;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid category ID"
        }
      });
      return;
    }

    const bookCategory = await updateBookCategory(categoryId, updateData);
    
    res.json({
      success: true,
      data: bookCategory
    });
  } catch (error: any) {
    if (error.message === "BOOK_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book category not found"
        }
      });
      return;
    }

    if (error.message === "PARENT_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Parent category not found"
        }
      });
      return;
    }

    if (error.message === "CANNOT_SET_SELF_AS_PARENT") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Cannot set category as its own parent"
        }
      });
      return;
    }
    
    if (error.message === "BOOK_CATEGORY_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Book category with this slug already exists"
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
    
    next(error);
  }
}

export async function deleteBookCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid category ID"
        }
      });
      return;
    }

    await deleteBookCategory(categoryId);
    
    res.json({
      success: true,
      message: "Book category deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "BOOK_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Book category not found"
        }
      });
      return;
    }
    
    if (error.message === "BOOK_CATEGORY_HAS_BOOKS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Cannot delete category as it contains books"
        }
      });
      return;
    }

    if (error.message === "BOOK_CATEGORY_HAS_CHILDREN") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Cannot delete category as it has child categories"
        }
      });
      return;
    }
    
    next(error);
  }
}