import { Router } from 'express';
import { validateLanguage } from '../middlewares/language.middleware';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware';
import { 
  createArticleHandler, 
  getArticlesHandler, 
  getArticleByIdHandler, 
  getArticleBySlugHandler,
  updateArticleHandler, 
  deleteArticleHandler 
} from '../controllers/article.controller';

const router = Router({ mergeParams: true });

// Create article
router.post('/', 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_ARTICLE"), 
  createArticleHandler
);

// Get all articles with filtering and pagination
router.get('/', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_ARTICLE"), 
  getArticlesHandler
);

// Get article by ID
router.get('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_ARTICLE"), 
  getArticleByIdHandler
);

// Get article by slug
router.get('/slug/:slug', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_ARTICLE"), 
  getArticleBySlugHandler
);

// Update article
router.put('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_ARTICLE"), 
  updateArticleHandler
);

// Delete article
router.delete('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_ARTICLE"), 
  deleteArticleHandler
);

export default router;