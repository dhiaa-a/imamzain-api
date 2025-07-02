import { Request, Response, NextFunction } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} from '../services/category.service';
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '../types/category.types';

export const createCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lang = req.params.lang as string;
    const categoryData: CreateCategoryRequest = req.body;

    const category = await createCategory(categoryData, lang);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lang = req.params.lang as string;
    const filters: CategoryFilters = req.query;

    const result = await getCategories(filters, lang);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lang = req.params.lang as string;
    const id = parseInt(req.params.id);

    const category = await getCategoryById(id, lang);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlugHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lang = req.params.lang as string;
    const slug = req.params.slug;

    const category = await getCategoryBySlug(slug, lang);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lang = req.params.lang as string;
    const id = parseInt(req.params.id);
    const updateData: UpdateCategoryRequest = req.body;

    const category = await updateCategory(id, updateData, lang);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await deleteCategory(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};