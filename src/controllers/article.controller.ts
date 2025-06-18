// src/controllers/article.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createArticle,
  getArticleById,
  getArticleBySlug,
  getArticles,
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
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid article ID"
        }
      });
      return;
    }

    const article = await getArticleById(articleId, lang);
    
    if (!article) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
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
    
    if (!article) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Article not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: article
    });
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
      search: search as string
    };

    const result = await getArticles(query);
    
    res.json({
      success: true,
      data: result.articles,
      pagination: result.pagination
    });
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
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid article ID"
        }
      });
      return;
    }

    const article = await updateArticle(articleId, updateData);
    
    res.json({
      success: true,
      data: article
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
    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid article ID"
        }
      });
      return;
    }

    await deleteArticle(articleId);
    
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
  }
}