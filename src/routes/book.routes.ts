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
import { 
  validateCreateBook, 
  validateUpdateBook, 
  validateCreateBookCategory, 
  validateUpdateBookCategory 
} from "../validations/book.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const bookRouter = Router();

// =============================================================================
// BOOK CATEGORY ROUTES (Admin/Management - No Language Required)
// =============================================================================

// GET /api/v1/books/categories - Get all book categories (public)
bookRouter.get("/categories", getBookCategoriesHandler);

// POST /api/v1/books/categories - Create book category (admin only)
bookRouter.post("/categories", 
  authenticateJWT,
  authorize("CREATE_BOOK_CATEGORY"),
  validateCreateBookCategory,
  createBookCategoryHandler
);

// GET /api/v1/books/categories/:id - Get book category by ID (public)
bookRouter.get("/categories/:id", getBookCategoryHandler);

// PUT /api/v1/books/categories/:id - Update book category (admin only)
bookRouter.put("/categories/:id", 
  authenticateJWT,
  authorize("UPDATE_BOOK_CATEGORY"),
  validateUpdateBookCategory,
  updateBookCategoryHandler
);

// DELETE /api/v1/books/categories/:id - Delete book category (admin only)
bookRouter.delete("/categories/:id", 
  authenticateJWT,
  authorize("DELETE_BOOK_CATEGORY"),
  deleteBookCategoryHandler
);

// GET /api/v1/books/categories/slug/:slug - Get book category by slug (public)
bookRouter.get("/categories/slug/:slug", getBookCategoryBySlugHandler);

// =============================================================================
// LANGUAGE-SPECIFIC BOOK CATEGORY ROUTES (Frontend/Public API)
// =============================================================================

// GET /api/v1/books/:lang/categories - Get all book categories with language (public)
bookRouter.get("/:lang/categories", 
  validateLanguage, 
  getBookCategoriesHandler
);

// GET /api/v1/books/:lang/categories/:id - Get book category by ID with language (public)
bookRouter.get("/:lang/categories/:id", 
  validateLanguage, 
  getBookCategoryHandler
);

// GET /api/v1/books/:lang/categories/slug/:slug - Get book category by slug with language (public)
bookRouter.get("/:lang/categories/slug/:slug", 
  validateLanguage, 
  getBookCategoryBySlugHandler
);

// =============================================================================
// LANGUAGE-SPECIFIC BOOK ROUTES (Frontend/Public API)
// =============================================================================

// GET /api/v1/books/:lang - Get all books with filtering and language (public)
bookRouter.get("/:lang", 
  validateLanguage, 
  getBooksHandler
);

// POST /api/v1/books/:lang - Create new book (requires permission)
bookRouter.post("/:lang", 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_BOOK"), 
  validateCreateBook, 
  createBookHandler
);

// GET /api/v1/books/:lang/slug/:slug - Get book by slug with language (public)
bookRouter.get("/:lang/slug/:slug", 
  validateLanguage, 
  getBookBySlugHandler
);

// GET /api/v1/books/:lang/:id - Get book by ID with language (public)
bookRouter.get("/:lang/:id", 
  validateLanguage, 
  getBookHandler
);

// PUT /api/v1/books/:lang/:id - Update book (requires permission)
bookRouter.put("/:lang/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_BOOK"), 
  validateUpdateBook, 
  updateBookHandler
);

// DELETE /api/v1/books/:lang/:id - Delete book (requires permission)
bookRouter.delete("/:lang/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_BOOK"), 
  deleteBookHandler
);

export default bookRouter;