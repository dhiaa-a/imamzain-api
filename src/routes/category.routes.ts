// src/routes/category.routes.ts
import { Router } from "express";
import {
  createCategoryHandler,
  getCategoryHandler,
  getCategoryBySlugHandler,
  getCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from "../controllers/category.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { validateCreateCategory, validateUpdateCategory } from "../validations/category.validations";
import { validateLanguage } from "../middlewares/language.middleware";

const categoryRouter = Router();

// GET /api/v1/:lang/categories - Get all categories with filtering (public)
categoryRouter.get("/:lang/categories", validateLanguage, getCategoriesHandler);

// GET /api/v1/:lang/categories/:id - Get category by ID (public)
categoryRouter.get("/:lang/categories/:id", validateLanguage, getCategoryHandler);

// GET /api/v1/:lang/categories/slug/:slug - Get category by slug (public)
categoryRouter.get("/:lang/categories/slug/:slug", validateLanguage, getCategoryBySlugHandler);

// POST /api/v1/:lang/categories - Create new category (requires permission)
categoryRouter.post("/:lang/categories", 
  validateLanguage, 
  authenticateJWT, 
  authorize("CREATE_CATEGORY"), 
  validateCreateCategory, 
  createCategoryHandler
);

// PUT /api/v1/:lang/categories/:id - Update category (requires permission)
categoryRouter.put("/:lang/categories/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("UPDATE_CATEGORY"), 
  validateUpdateCategory, 
  updateCategoryHandler
);

// DELETE /api/v1/:lang/categories/:id - Delete category (requires permission)
categoryRouter.delete("/:lang/categories/:id", 
  validateLanguage, 
  authenticateJWT, 
  authorize("DELETE_CATEGORY"), 
  deleteCategoryHandler
);

export default categoryRouter;