// src/controllers/book.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createBook,
  getBookById,
  getBookBySlug,
  getBooks,
  updateBook,
  deleteBook
} from "../services/book.service";
import { 
  createBookSchema,
  updateBookSchema,
  getBookSchema,
  getBookBySlugSchema,
  getBooksSchema,
  deleteBookSchema
} from "../validations/book.validations";

export async function createBookHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationResult = createBookSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    
    const book = await createBook(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error: any) {
    if (error.message.includes('category with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }
    
    if (error.message.includes('Tags with IDs') && error.message.includes('do not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('Cover attachment with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('File attachment with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('Parent book with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
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
    const validationResult = getBookSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id, lang } = validationResult.data.params;
    const book = await getBookById(id, lang);
    
    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book retrieved successfully',
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
    const validationResult = getBookBySlugSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { slug, lang } = validationResult.data.params;
    const book = await getBookBySlug(slug, lang);
    
    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book retrieved successfully',
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
    const validationResult = getBooksSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { lang } = validationResult.data.params;
    const { page, limit, categoryId, isPublished, publishYear, parentBookId, hasParent, tagIds, search } = validationResult.data.query;

    const query = {
      categoryId,
      isPublished,
      publishYear,
      parentBookId,
      hasParent,
      tagIds,
      search,
      limit, 
    };

    const result = await getBooks(query, lang);
    
    res.json({
      success: true,
      message: 'Books retrieved successfully',
      data: result
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
    const validationResult = updateBookSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id } = validationResult.data.params;
    const book = await updateBook(id, req.body);
    
    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error: any) {
    if (error.message.includes('category with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }
    
    if (error.message.includes('Tags with IDs') && error.message.includes('do not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('Cover attachment with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('File attachment with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message.includes('Parent book with ID') && error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    if (error.message === 'Book cannot be its own parent') {
      res.status(400).json({
        success: false,
        message: error.message
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
    const validationResult = deleteBookSchema.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id } = validationResult.data.params;
    const deleted = await deleteBook(id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error: any) {
    if (error.message.includes('Cannot delete book that has parts')) {
      res.status(409).json({
        success: false,
        message: error.message
      });
      return;
    }
    
    next(error);
  }
}