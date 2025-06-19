// src/controllers/article.controller.ts
<<<<<<< HEAD
import { Request, Response } from "express";
=======
import { Request, Response, NextFunction } from "express";
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
import {
  createArticle,
  getArticleById,
  getArticleBySlug,
  getArticles,
<<<<<<< HEAD
  getArticlesByCategory,
  updateArticle,
  deleteArticle
} from "../services/article.service";
import { SupportedLanguageCode } from "../types/language.types";

export async function createArticleHandler(req: Request, res: Response): Promise<void> {
  try {
    const article = await createArticle(req.body);
    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    switch (error.message) {
      case "CATEGORY_NOT_FOUND":
        statusCode = 404;
        errorCode = "CATEGORY_NOT_FOUND";
        break;
      case "EXACTLY_ONE_DEFAULT_TRANSLATION_REQUIRED":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "INVALID_SLUG_FORMAT":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "SOME_ATTACHMENTS_NOT_FOUND":
        statusCode = 404;
        errorCode = "ATTACHMENTS_NOT_FOUND";
        break;
      case "DUPLICATE_ATTACHMENT_IDS":
      case "DUPLICATE_ATTACHMENT_ORDERS":
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

export async function getArticleHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id, lang } = req.params;
    const articleId = parseInt(id);
    
=======
  updateArticle,
  deleteArticle
} from "../services/article.service";
import { CreateArticleRequest, UpdateArticleRequest } from "../types/article.types";

export async function createArticleHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const articleData: CreateArticleRequest = req.body;
    const { lang } = req.params;
    
    // Basic validation
    if (!articleData.categoryId || !articleData.translations) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required fields: categoryId, translations"
        }
      });
      return;
    }

    if (!Array.isArray(articleData.translations) || articleData.translations.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "At least one translation is required"
        }
      });
      return;
    }

    const article = await createArticle(articleData);
    
    res.status(201).json({
      success: true,
      data: article,
      message: `Article created with auto-generated slug: ${article.slug}`
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article category not found"
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

export async function getArticleHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const articleId = parseInt(id);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
<<<<<<< HEAD
          code: "INVALID_ID",
=======
          code: "BAD_REQUEST",
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
          message: "Invalid article ID"
        }
      });
      return;
    }

<<<<<<< HEAD
    const article = await getArticleById(articleId, lang as SupportedLanguageCode);
=======
    const article = await getArticleById(articleId, lang);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    
    if (!article) {
      res.status(404).json({
        success: false,
        error: {
<<<<<<< HEAD
          code: "ARTICLE_NOT_FOUND",
=======
          code: "NOT_FOUND",
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
          message: "Article not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
<<<<<<< HEAD
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

export async function getArticleBySlugHandler(req: Request, res: Response): Promise<void> {
  try {
    const { slug, lang } = req.params;
    
    const article = await getArticleBySlug(slug, lang as SupportedLanguageCode);
=======
  } catch (error) {
    next(error);
  }
}

export async function getArticleBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, lang } = req.params;

    const article = await getArticleBySlug(slug, lang);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    
    if (!article) {
      res.status(404).json({
        success: false,
        error: {
<<<<<<< HEAD
          code: "ARTICLE_NOT_FOUND",
=======
          code: "NOT_FOUND",
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
          message: "Article not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
<<<<<<< HEAD
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

export async function getArticlesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { lang } = req.params;
    const { page, limit, categoryId, search } = req.query;
    
    const query = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      languageCode: lang as SupportedLanguageCode,
=======
  } catch (error) {
    next(error);
  }
}

export async function getArticlesHandler(
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
      search
    } = req.query;

    const query = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      languageCode: lang,
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
      search: search as string
    };

    const result = await getArticles(query);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination
    });
<<<<<<< HEAD
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

export async function getArticlesByCategoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId, lang } = req.params;
    const { page, limit, search } = req.query;
    
    const categoryIdInt = parseInt(categoryId);
    
    if (isNaN(categoryIdInt)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CATEGORY_ID",
          message: "Invalid category ID"
        }
      });
      return;
    }
    
    const query = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      languageCode: lang as SupportedLanguageCode,
      search: search as string
    };

    const result = await getArticlesByCategory(categoryIdInt, query);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
      category: result.category
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    if (error.message === "CATEGORY_NOT_FOUND") {
      statusCode = 404;
      errorCode = "CATEGORY_NOT_FOUND";
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

export async function updateArticleHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);
    
=======
  } catch (error) {
    next(error);
  }
}

export async function updateArticleHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    const updateData: UpdateArticleRequest = req.body;
    
    const articleId = parseInt(id);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
<<<<<<< HEAD
          code: "INVALID_ID",
=======
          code: "BAD_REQUEST",
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
          message: "Invalid article ID"
        }
      });
      return;
    }

<<<<<<< HEAD
    const article = await updateArticle(articleId, req.body);
=======
    const article = await updateArticle(articleId, updateData);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    
    res.json({
      success: true,
      data: article
    });
  } catch (error: any) {
<<<<<<< HEAD
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    switch (error.message) {
      case "ARTICLE_NOT_FOUND":
        statusCode = 404;
        errorCode = "ARTICLE_NOT_FOUND";
        break;
      case "INVALID_SLUG_FORMAT":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "ONLY_ONE_DEFAULT_TRANSLATION_ALLOWED":
        statusCode = 400;
        errorCode = "VALIDATION_ERROR";
        break;
      case "SOME_ATTACHMENTS_NOT_FOUND":
        statusCode = 404;
        errorCode = "ATTACHMENTS_NOT_FOUND";
        break;
      case "DUPLICATE_ATTACHMENT_IDS":
      case "DUPLICATE_ATTACHMENT_ORDERS":
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

export async function deleteArticleHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);
    
=======
    if (error.message === "ARTICLE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found"
        }
      });
      return;
    }
    
    if (error.message === "SLUG_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Article with this slug already exists"
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

export async function deleteArticleHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, lang } = req.params;
    
    const articleId = parseInt(id);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
<<<<<<< HEAD
          code: "INVALID_ID",
=======
          code: "BAD_REQUEST",
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
          message: "Invalid article ID"
        }
      });
      return;
    }

    await deleteArticle(articleId);
    
<<<<<<< HEAD
    res.status(204).send();
  } catch (error: any) {
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";
    
    if (error.message === "ARTICLE_NOT_FOUND") {
      statusCode = 404;
      errorCode = "ARTICLE_NOT_FOUND";
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message
      }
    });
=======
    res.json({
      success: true,
      message: "Article deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "ARTICLE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found"
        }
      });
      return;
    }
    
    next(error);
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
  }
}