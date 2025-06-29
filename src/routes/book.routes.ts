// src/routes/book.routes.ts
import { Router } from "express";
import {
  createBookHandler,
  getBookHandler,
  getBookBySlugHandler,
  getBooksHandler,
  updateBookHandler,
  deleteBookHandler,
  createBookCategoryHandler,
  getBookCategoriesHandler,
  getBookCategoryHandler,
  getBookCategoryBySlugHandler,
  updateBookCategoryHandler,
  deleteBookCategoryHandler
} from "../controllers/book.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { validateCreateBook, validateUpdateBook, validateCreateBookCategory, validateUpdateBookCategory } from "../validations/book.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const bookRouter = Router();

// Book Category routes (without language prefix)
// GET /api/v1/book-categories - Get all book categories (public)
bookRouter.get("/book-categories", getBookCategoriesHandler);

// POST /api/v1/book-categories - Create book category (requires permission)
bookRouter.post("/book-categories", 
  authenticateJWT,
  authorize("CREATE_BOOK_CATEGORY"),
  validateCreateBookCategory,
  createBookCategoryHandler
);

// PUT /api/v1/book-categories/:id - Update book category (requires permission)
bookRouter.put("/book-categories/:id", 
  authenticateJWT,
  authorize("UPDATE_BOOK_CATEGORY"),
  validateUpdateBookCategory,
  updateBookCategoryHandler
);

// DELETE /api/v1/book-categories/:id - Delete book category (requires permission)
bookRouter.delete("/book-categories/:id", 
  authenticateJWT,
  authorize("DELETE_BOOK_CATEGORY"),
  deleteBookCategoryHandler
);

// Language-specific book category routes
// GET /api/v1/:lang/book-categories - Get all book categories with language (public)
bookRouter.get("/:lang/book-categories", validateLanguage, getBookCategoriesHandler);

// GET /api/v1/:lang/book-categories/:id - Get book category by ID with language (public)
bookRouter.get("/:lang/book-categories/:id", validateLanguage, getBookCategoryHandler);

// GET /api/v1/:lang/book-categories/slug/:slug - Get book category by slug with language (public)
bookRouter.get("/:lang/book-categories/slug/:slug", validateLanguage, getBookCategoryBySlugHandler);

// Language-specific book routes
// GET /api/v1/:lang/books - Get all books with filtering (public)
bookRouter.get("/:lang/books", validateLanguage, getBooksHandler);

// GET /api/v1/:lang/books/:id - Get book by ID (public)
bookRouter.get("/:lang/books/:id", validateLanguage, getBookHandler);

// GET /api/v1/:lang/books/slug/:slug - Get book by slug (public)
bookRouter.get("/:lang/books/slug/:slug", validateLanguage, getBookBySlugHandler);

// POST /api/v1/:lang/books - Create new book (requires permission)
bookRouter.post("/:lang/books", 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_BOOK"), 
  validateCreateBook, 
  createBookHandler
);

// PUT /api/v1/:lang/books/:id - Update book (requires permission)
bookRouter.put("/:lang/books/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_BOOK"), 
  validateUpdateBook, 
  updateBookHandler
);

// DELETE /api/v1/:lang/books/:id - Delete book (requires permission)
bookRouter.delete("/:lang/books/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_BOOK"), 
  deleteBookHandler
);

export default bookRouter;