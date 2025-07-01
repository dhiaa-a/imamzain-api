import { Request, Response, NextFunction } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  checkSlugExists,
  checkParentExists,
} from '../services/articleCategory.service';
import { CreateArticleCategoryRequest, UpdateArticleCategoryRequest } from '../types/articleCategory.types';

export const createArticleCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: CreateArticleCategoryRequest = req.body;

    // Check if slug already exists (only if manually provided)
    if (data.slug) {
      const slugExists = await checkSlugExists(data.slug);
      if (slugExists) {
        res.status(400).json({
          success: false,
          message: 'Category with this slug already exists',
        });
        return;
      }
    }

    // Check if parent exists (if parentId is provided)
    if (data.parentId) {
      const parentExists = await checkParentExists(data.parentId);
      if (!parentExists) {
        res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
        return;
      }
    }

    const category = await createCategory(data);

    res.status(201).json({
      success: true,
      message: 'Article category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, parentId, isActive, languageCode, search } = req.query as any;

    const result = await getAllCategories({
      page,
      limit,
      parentId,
      isActive,
      languageCode,
      search,
    });

    res.status(200).json({
      success: true,
      message: 'Article categories retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;

    const category = await getCategoryById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Article category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params as any;

    const category = await getCategoryBySlug(slug);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Article category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticleCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const data: UpdateArticleCategoryRequest = req.body;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Article category not found',
      });
      return;
    }

    // Check if slug already exists (if slug is being updated)
    if (data.slug) {
      const slugExists = await checkSlugExists(data.slug, id);
      if (slugExists) {
        res.status(400).json({
          success: false,
          message: 'Category with this slug already exists',
        });
        return;
      }
    }

    // Check if parent exists (if parentId is provided)
    if (data.parentId) {
      const parentExists = await checkParentExists(data.parentId);
      if (!parentExists) {
        res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
        return;
      }

      // Prevent setting parent to self or child
      if (data.parentId === id) {
        res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent',
        });
        return;
      }
    }

    const category = await updateCategory(id, data);

    res.status(200).json({
      success: true,
      message: 'Article category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticleCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Article category not found',
      });
      return;
    }

    await deleteCategory(id);

    res.status(200).json({
      success: true,
      message: 'Article category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};