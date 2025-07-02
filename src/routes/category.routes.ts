import { Router } from 'express';
import { validateLanguage } from '../middlewares/language.middleware';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  getCategoryBySlugHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from '../controllers/category.controller';

const router = Router({ mergeParams: true });

// GET /api/:lang/categories - Get all categories
router.get(
  '/',
  validateLanguage,
  authenticateJWT,
  authorize('READ_CATEGORY'),
  getCategoriesHandler
);

// POST /api/:lang/categories - Create new category
router.post(
  '/',
  validateLanguage,
  authenticateJWT,
  authorize('CREATE_CATEGORY'),
  createCategoryHandler
);

// GET /api/:lang/categories/:id - Get category by ID
router.get(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize('READ_CATEGORY'),
  getCategoryByIdHandler
);

// PUT /api/:lang/categories/:id - Update category
router.put(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize('UPDATE_CATEGORY'),
  updateCategoryHandler
);

// DELETE /api/:lang/categories/:id - Delete category
router.delete(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize('DELETE_CATEGORY'),
  deleteCategoryHandler
);

// GET /api/:lang/categories/slug/:slug - Get category by slug
router.get(
  '/slug/:slug',
  validateLanguage,
  authenticateJWT,
  authorize('READ_CATEGORY'),
  getCategoryBySlugHandler
);

export default router;