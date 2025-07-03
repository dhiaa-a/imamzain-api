import { Request, Response, NextFunction } from 'express';
import { 
  createArticleSchemaValidation, 
  updateArticleSchemaValidation,
  getArticleSchemaValidation,
  getArticleBySlugSchemaValidation,
  getArticlesSchemaValidation,
  deleteArticleSchemaValidation
} from '../validations/article.validations';
import { 
  createArticle, 
  getArticles, 
  getArticleById, 
  getArticleBySlug,
  updateArticle, 
  deleteArticle 
} from '../services/article.service';

export const createArticleHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = createArticleSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const result = await createArticle(req.body);
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getArticlesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getArticlesSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { lang } = validationResult.data.params;
    const { page, limit, categoryId, tagIds, isPublished, search } = validationResult.data.query;
    
    const filters = {
      categoryId,
      tagIds,
      isPublished,
      search
    };

    const result = await getArticles(lang, filters, page, limit);
    res.status(200).json({
      success: true,
      message: 'Articles retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getArticleSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id, lang } = validationResult.data.params;
    const result = await getArticleById(id, lang);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlugHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getArticleBySlugSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { slug, lang } = validationResult.data.params;
    const result = await getArticleBySlug(slug, lang);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticleHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = updateArticleSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id } = validationResult.data.params;
    const result = await updateArticle(id, req.body);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticleHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = deleteArticleSchemaValidation.safeParse(req);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { id } = validationResult.data.params;
    const result = await deleteArticle(id);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};