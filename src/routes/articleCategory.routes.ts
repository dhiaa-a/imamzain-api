import { Router } from 'express';
import {
  createArticleCategory,
  getArticleCategories,
  getArticleCategoryById,
  getArticleCategoryBySlug,
  updateArticleCategory,
  deleteArticleCategory,
} from '../controllers/articleCategory.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  createArticleCategorySchema,
  updateArticleCategorySchema,
  articleCategoryIdSchema,
  articleCategorySlugSchema,
  articleCategoryQuerySchema,
} from '../validations/articleCategory.validations';

const router = Router();

// GET /api/article-categories - Get all categories with pagination and filters
router.get(
  '/',
  validateRequest({ query: articleCategoryQuerySchema }),
  getArticleCategories
);

// POST /api/article-categories - Create new category
router.post(
  '/',
  validateRequest({ body: createArticleCategorySchema }),
  createArticleCategory
);

// GET /api/article-categories/slug/:slug - Get category by slug
router.get(
  '/slug/:slug',
  validateRequest({ params: articleCategorySlugSchema }),
  getArticleCategoryBySlug
);

// GET /api/article-categories/:id - Get category by ID
router.get(
  '/:id',
  validateRequest({ params: articleCategoryIdSchema }),
  getArticleCategoryById
);

// PUT /api/article-categories/:id - Update category by ID
router.put(
  '/:id',
  validateRequest({
    params: articleCategoryIdSchema,
    body: updateArticleCategorySchema,
  }),
  updateArticleCategory
);

// DELETE /api/article-categories/:id - Delete category by ID
router.delete(
  '/:id',
  validateRequest({ params: articleCategoryIdSchema }),
  deleteArticleCategory
);

export default router;