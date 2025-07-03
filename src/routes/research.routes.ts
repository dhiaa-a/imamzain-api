import { Router } from 'express';
import { validateLanguage } from '../middlewares/language.middleware';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware';
import { 
  createResearchHandler,
  getResearchesHandler,
  getResearchByIdHandler,
  getResearchBySlugHandler,
  updateResearchHandler,
  deleteResearchHandler
} from '../controllers/research.controller';

const router = Router({ mergeParams: true });

// Create research
router.post('/', 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_RESEARCH"), 
  createResearchHandler
);

// Get all researches with filtering and pagination
router.get('/', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_RESEARCH"), 
  getResearchesHandler
);

// Get research by slug (must come before /:id to avoid conflicts)
router.get('/slug/:slug', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_RESEARCH"), 
  getResearchBySlugHandler
);

// Get research by ID
router.get('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("READ_RESEARCH"), 
  getResearchByIdHandler
);

// Update research
router.put('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_RESEARCH"), 
  updateResearchHandler
);

// Delete research
router.delete('/:id', 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_RESEARCH"), 
  deleteResearchHandler
);

export default router;