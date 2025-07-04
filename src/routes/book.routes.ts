// src/routes/book.routes.ts
import { Router } from "express";
import {
  createBookHandler,
  getBookHandler,
  getBookBySlugHandler,
  getBooksHandler,
  updateBookHandler,
  deleteBookHandler
} from "../controllers/book.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { 
  validateCreateBook, 
  validateUpdateBook
} from "../validations/book.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const bookRouter = Router({ mergeParams: true });

// GET /api/v1/:lang/books - Get all books with filtering and language (public)
bookRouter.get("/", 
  validateLanguage, 
  getBooksHandler
);

// POST /api/v1/:lang/books - Create new book (requires permission)
bookRouter.post("/", 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_BOOK"), 
  validateCreateBook, 
  createBookHandler
);

// GET /api/v1/:lang/books/slug/:slug - Get book by slug with language (public)
bookRouter.get("/slug/:slug", 
  validateLanguage, 
  getBookBySlugHandler
);

// GET /api/v1/:lang/books/:id - Get book by ID with language (public)
bookRouter.get("/:id", 
  validateLanguage, 
  getBookHandler
);

// PUT /api/v1/:lang/books/:id - Update book (requires permission)
bookRouter.put("/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_BOOK"), 
  validateUpdateBook, 
  updateBookHandler
);

// DELETE /api/v1/:lang/books/:id - Delete book (requires permission)
bookRouter.delete("/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_BOOK"), 
  deleteBookHandler
);

export default bookRouter;