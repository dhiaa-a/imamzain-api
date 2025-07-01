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
} from '../services/bookCategory.service';
import { CreateBookCategoryRequest, UpdateBookCategoryRequest } from '../types/bookCategory.types';

export const createBookCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: CreateBookCategoryRequest = req.body;

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
      message: 'Book category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      message: 'Book categories retrieved successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;

    const category = await getCategoryById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Book category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params as any;

    const category = await getCategoryBySlug(slug);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Book category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Book category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const data: UpdateBookCategoryRequest = req.body;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Book category not found',
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
      message: 'Book category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Book category not found',
      });
      return;
    }

    await deleteCategory(id);

    res.status(200).json({
      success: true,
      message: 'Book category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};