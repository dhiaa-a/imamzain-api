import { Router } from 'express';
import {
  createBookCategory,
  getBookCategories,
  getBookCategoryById,
  getBookCategoryBySlug,
  updateBookCategory,
  deleteBookCategory,
} from '../controllers/bookCategory.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  createBookCategorySchema,
  updateBookCategorySchema,
  bookCategoryIdSchema,
  bookCategorySlugSchema,
  bookCategoryQuerySchema,
} from '../validations/bookCategory.validations';

const router = Router();

// GET /api/book-categories - Get all categories with pagination and filters
router.get(
  '/',
  validateRequest({ query: bookCategoryQuerySchema }),
  getBookCategories
);

// POST /api/book-categories - Create new category
router.post(
  '/',
  validateRequest({ body: createBookCategorySchema }),
  createBookCategory
);

// GET /api/book-categories/slug/:slug - Get category by slug
router.get(
  '/slug/:slug',
  validateRequest({ params: bookCategorySlugSchema }),
  getBookCategoryBySlug
);

// GET /api/book-categories/:id - Get category by ID
router.get(
  '/:id',
  validateRequest({ params: bookCategoryIdSchema }),
  getBookCategoryById
);

// PUT /api/book-categories/:id - Update category by ID
router.put(
  '/:id',
  validateRequest({
    params: bookCategoryIdSchema,
    body: updateBookCategorySchema,
  }),
  updateBookCategory
);

// DELETE /api/book-categories/:id - Delete category by ID
router.delete(
  '/:id',
  validateRequest({ params: bookCategoryIdSchema }),
  deleteBookCategory
);

export default router;