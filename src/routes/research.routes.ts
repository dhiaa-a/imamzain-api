// src/routes/research.routes.ts
import { Router } from "express";
import {
  createResearchHandler,
  getResearchHandler,
  getResearchBySlugHandler,
  getResearchListHandler,
  updateResearchHandler,
  deleteResearchHandler,
  createResearchCategoryHandler,
  getResearchCategoriesHandler,
  updateResearchCategoryHandler,
  deleteResearchCategoryHandler
} from "../controllers/research.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { validateCreateResearch, validateUpdateResearch, validateCreateResearchCategory, validateUpdateResearchCategory } from "../validations/research.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const researchRouter = Router();

// Research Category routes
// GET /api/v1/research-categories - Get all research categories (public)
researchRouter.get("/research-categories", getResearchCategoriesHandler);

// POST /api/v1/research-categories - Create research category (requires permission)
researchRouter.post("/research-categories", 
  authenticateJWT,
  authorize("CREATE_RESEARCHTRANSLATIONCATEGORY"),
  validateCreateResearchCategory,
  createResearchCategoryHandler
);

// PUT /api/v1/research-categories/:id - Update research category (requires permission)
researchRouter.put("/research-categories/:id", 
  authenticateJWT,
  authorize("UPDATE_RESEARCHTRANSLATIONCATEGORY"),
  validateUpdateResearchCategory,
  updateResearchCategoryHandler
);

// DELETE /api/v1/research-categories/:id - Delete research category (requires permission)
researchRouter.delete("/research-categories/:id", 
  authenticateJWT,
  authorize("DELETE_RESEARCHTRANSLATIONCATEGORY"),
  deleteResearchCategoryHandler
);

// Language-specific research routes
// GET /api/v1/:lang/research - Get all research with filtering (public)
researchRouter.get("/:lang/research", validateLanguage, getResearchListHandler);

// GET /api/v1/:lang/research/:id - Get research by ID (public)
researchRouter.get("/:lang/research/:id", validateLanguage, getResearchHandler);

// GET /api/v1/:lang/research/slug/:slug - Get research by slug (public)
researchRouter.get("/:lang/research/slug/:slug", validateLanguage, getResearchBySlugHandler);

// POST /api/v1/:lang/research - Create new research (requires permission)
researchRouter.post("/:lang/research", 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_RESEARCH"), 
  validateCreateResearch, 
  createResearchHandler
);

// PUT /api/v1/:lang/research/:id - Update research (requires permission)
researchRouter.put("/:lang/research/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_RESEARCH"), 
  validateUpdateResearch, 
  updateResearchHandler
);

// DELETE /api/v1/:lang/research/:id - Delete research (requires permission)
researchRouter.delete("/:lang/research/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_RESEARCH"), 
  deleteResearchHandler
);

export default researchRouter;