// src/controllers/category.controller.ts
import { Request, Response } from "express";
import {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  getCategories,
  updateCategory,
  deleteCategory
} from "../services/category.service"; 
import { SupportedLanguageCode } from "../types/language.types";

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    switch (error.message) {
      case "EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "INVALID_SLUG_FORMAT":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      default:
        if (error.message.startsWith("UNSUPPORTED_LANGUAGES:")) {
          statusCode = 400;
          errorCode = "UNSUPPORTED_LANGUAGES";
        }
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message
      }
    });
  }
}

export async function getCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id, lang } = req.params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid category ID"
        }
      });
      return;
    }

    const category = await getCategoryById(categoryId, lang as SupportedLanguageCode);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: "Category not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      }
    });
  }
}

export async function getCategoryBySlugHandler(req: Request, res: Response): Promise<void> {
  try {
    const { slug, lang } = req.params;
    
    const category = await getCategoryBySlug(slug, lang as SupportedLanguageCode);
    
    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: "Category not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      }
    });
  }
}

export async function getCategoriesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { lang } = req.params;
    const { page, limit, search, includeCount } = req.query;
    
    const query = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      languageCode: lang as SupportedLanguageCode,
      search: search as string,
      includeCount: includeCount === 'true'
    };

    const result = await getCategories(query);
    
    res.json({
      success: true,
      data: result.categories,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message
      }
    });
  }
}

export async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid category ID"
        }
      });
      return;
    }

    const category = await updateCategory(categoryId, req.body);
    
    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    switch (error.message) {
      case "CATEGORY_NOT_FOUND":
        statusCode = 404;
        errorCode = "CATEGORY_NOT_FOUND";
        break;
      case "INVALID_SLUG_FORMAT":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      default:
        if (error.message.startsWith("UNSUPPORTED_LANGUAGES:")) {
          statusCode = 400;
          errorCode = "UNSUPPORTED_LANGUAGES";
        }
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message
      }
    });
  }
}

export async function deleteCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid category ID"
        }
      });
      return;
    }

    await deleteCategory(categoryId);
    
    res.status(204).send();
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    switch (error.message) {
      case "CATEGORY_NOT_FOUND":
        statusCode = 404;
        errorCode = "CATEGORY_NOT_FOUND";
        break;
      case "CATEGORY_HAS_ARTICLES":
        statusCode = 400;
        errorCode = "CATEGORY_HAS_ARTICLES";
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message
      }
    });
  }
}