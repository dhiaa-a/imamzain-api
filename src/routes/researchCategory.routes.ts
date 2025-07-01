import { Router } from 'express';
import {
  createResearchCategory,
  getResearchCategories,
  getResearchCategoryById,
  getResearchCategoryBySlug,
  updateResearchCategory,
  deleteResearchCategory,
} from '../controllers/researchCategory.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  createResearchCategorySchema,
  updateResearchCategorySchema,
  researchCategoryIdSchema,
  researchCategorySlugSchema,
  researchCategoryQuerySchema,
} from '../validations/researchCategory.validations';

const router = Router();

// GET /api/research-categories - Get all categories with pagination and filters
router.get(
  '/',
  validateRequest({ query: researchCategoryQuerySchema }),
  getResearchCategories
);

// POST /api/research-categories - Create new category
router.post(
  '/',
  validateRequest({ body: createResearchCategorySchema }),
  createResearchCategory
);

// GET /api/research-categories/slug/:slug - Get category by slug
router.get(
  '/slug/:slug',
  validateRequest({ params: researchCategorySlugSchema }),
  getResearchCategoryBySlug
);

// GET /api/research-categories/:id - Get category by ID
router.get(
  '/:id',
  validateRequest({ params: researchCategoryIdSchema }),
  getResearchCategoryById
);

// PUT /api/research-categories/:id - Update category by ID
router.put(
  '/:id',
  validateRequest({
    params: researchCategoryIdSchema,
    body: updateResearchCategorySchema,
  }),
  updateResearchCategory
);

// DELETE /api/research-categories/:id - Delete category by ID
router.delete(
  '/:id',
  validateRequest({ params: researchCategoryIdSchema }),
  deleteResearchCategory
);

export default router;