import { Router } from 'express';
import { validateLanguage } from '../middlewares/language.middleware';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware';
import {
  createTagHandler,
  getTagsHandler,
  getTagHandler,
  getTagBySlugHandler,
  updateTagHandler,
  deleteTagHandler
} from '../controllers/tag.controller';

const router = Router({ mergeParams: true });

// GET /api/:lang/tags - Get all tags
router.get(
  '/',
  validateLanguage,
  authenticateJWT,
  authorize("READ_TAG"),
  getTagsHandler
);

// POST /api/:lang/tags - Create new tag
router.post(
  '/',
  validateLanguage,
  authenticateJWT,
  authorize("CREATE_TAG"),
  createTagHandler
);

// GET /api/:lang/tags/:id - Get tag by ID
router.get(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize("READ_TAG"),
  getTagHandler
);

// PUT /api/:lang/tags/:id - Update tag
router.put(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize("UPDATE_TAG"),
  updateTagHandler
);

// DELETE /api/:lang/tags/:id - Delete tag
router.delete(
  '/:id',
  validateLanguage,
  authenticateJWT,
  authorize("DELETE_TAG"),
  deleteTagHandler
);

// GET /api/:lang/tags/slug/:slug - Get tag by slug
router.get(
  '/slug/:slug',
  validateLanguage,
  authenticateJWT,
  authorize("READ_TAG"),
  getTagBySlugHandler
);

export default router;