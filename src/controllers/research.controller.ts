// src/controllers/research.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createResearch,
  getResearchById,
  getResearchBySlug,
  getResearch,
  updateResearch,
  deleteResearch,
  createResearchCategory,
  getResearchCategories,
  updateResearchCategory,
  deleteResearchCategory
} from "../services/research.service";
import { CreateResearchRequest, UpdateResearchRequest, CreateResearchCategoryRequest, UpdateResearchCategoryRequest } from "../types/research.types";

export async function createResearchHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const researchData: CreateResearchRequest = req.body;
    const { lang } = req.params;
    
    // Basic validation
    if (!researchData.date || !researchData.pages || !researchData.categoryId || !researchData.translations) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required fields: date, pages, categoryId, translations"
        }
      });
      return;
    }

    if (!Array.isArray(researchData.translations) || researchData.translations.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "At least one translation is required"
        }
      });
      return;
    }

    const research = await createResearch(researchData);
    
    res.status(201).json({
      success: true,
      data: research,
      message: `Research created with auto-generated slug: ${research.slug}`
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research category not found"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_LANGUAGE_CODES") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more language codes are invalid"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_SLUG_FORMAT") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens"
        }
      });
      return;
    }
    
    if (error.message === "EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Exactly one translation must be marked as default"
        }
      });
      return;
    }

    if (error.message === "SOME_ATTACHMENTS_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Some attachment IDs do not exist"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment IDs found"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_ORDERS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment order values found"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function getResearchHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const researchId = parseInt(id);
    if (isNaN(researchId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid research ID"
        }
      });
      return;
    }

    const research = await getResearchById(researchId, lang);
    
    if (!research) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: research
    });
  } catch (error) {
    next(error);
  }
}

export async function getResearchBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, lang } = req.params;

    const research = await getResearchBySlug(slug, lang);
    
    if (!research) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: research
    });
  } catch (error) {
    next(error);
  }
}

export async function getResearchListHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lang } = req.params;
    const {
      page = "1",
      limit = "10",
      categoryId,
      search,
      year,
      dateFrom,
      dateTo
    } = req.query;

    const query = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      languageCode: lang,
      search: search as string,
      year: year ? parseInt(year as string) : undefined,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await getResearch(query);
    
    res.json({
      success: true,
      data: result.research,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResearchHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    const updateData: UpdateResearchRequest = req.body;
    
    const researchId = parseInt(id);
    if (isNaN(researchId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid research ID"
        }
      });
      return;
    }

    const research = await updateResearch(researchId, updateData);
    
    res.json({
      success: true,
      data: research
    });
  } catch (error: any) {
    if (error.message === "RESEARCH_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research not found"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_SLUG_FORMAT") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens"
        }
      });
      return;
    }
    
    if (error.message === "INVALID_LANGUAGE_CODES") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "One or more language codes are invalid"
        }
      });
      return;
    }
    
    if (error.message === "ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Only one translation can be marked as default"
        }
      });
      return;
    }

    if (error.message === "SOME_ATTACHMENTS_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Some attachment IDs do not exist"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_IDS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment IDs found"
        }
      });
      return;
    }

    if (error.message === "DUPLICATE_ATTACHMENT_ORDERS") {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Duplicate attachment order values found"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function deleteResearchHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const researchId = parseInt(id);
    if (isNaN(researchId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid research ID"
        }
      });
      return;
    }

    await deleteResearch(researchId);
    
    res.json({
      success: true,
      message: "Research deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "RESEARCH_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research not found"
        }
      });
      return;
    }
    
    next(error);
  }
}

// Research Category handlers
export async function createResearchCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoryData: CreateResearchCategoryRequest = req.body;
    
    if (!categoryData.slug || !categoryData.name) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required fields: slug, name"
        }
      });
      return;
    }

    const category = await createResearchCategory(categoryData);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    if (error.message === "RESEARCH_CATEGORY_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Research category with this slug already exists"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function getResearchCategoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await getResearchCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResearchCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: UpdateResearchCategoryRequest = req.body;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid research category ID"
        }
      });
      return;
    }

    const category = await updateResearchCategory(categoryId, updateData);
    
    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    if (error.message === "RESEARCH_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research category not found"
        }
      });
      return;
    }
    
    if (error.message === "RESEARCH_CATEGORY_SLUG_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Research category with this slug already exists"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function deleteResearchCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid research category ID"
        }
      });
      return;
    }

    await deleteResearchCategory(categoryId);
    
    res.json({
      success: true,
      message: "Research category deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "RESEARCH_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Research category not found"
        }
      });
      return;
    }
    
    if (error.message === "RESEARCH_CATEGORY_HAS_RESEARCH") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Cannot delete research category as it contains research papers"
        }
      });
      return;
    }
    
    next(error);
  }
}