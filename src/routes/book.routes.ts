// src/routes/book.routes.ts
import { Router } from "express";
import {
  createBookHandler,
  getBookHandler,
  getBookBySlugHandler,
  getBooksHandler,
  updateBookHandler,
  deleteBookHandler,
  createBookTypeHandler,
  getBookTypesHandler,
  updateBookTypeHandler,
  deleteBookTypeHandler
} from "../controllers/book.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { validateCreateBook, validateUpdateBook, validateCreateBookType, validateUpdateBookType } from "../validations/book.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const bookRouter = Router();

// Book Type (Category) routes
// GET /api/v1/book-types - Get all book types (public)
bookRouter.get("/book-types", getBookTypesHandler);

// POST /api/v1/book-types - Create book type (requires permission)
bookRouter.post("/book-types", 
  authenticateJWT,
  authorize("CREATE_BOOKTYPE"),
  validateCreateBookType,
  createBookTypeHandler
);

// PUT /api/v1/book-types/:id - Update book type (requires permission)
bookRouter.put("/book-types/:id", 
  authenticateJWT,
  authorize("UPDATE_BOOKTYPE"),
  validateUpdateBookType,
  updateBookTypeHandler
);

// DELETE /api/v1/book-types/:id - Delete book type (requires permission)
bookRouter.delete("/book-types/:id", 
  authenticateJWT,
  authorize("DELETE_BOOKTYPE"),
  deleteBookTypeHandler
);

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