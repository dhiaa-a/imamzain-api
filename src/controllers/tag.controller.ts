import { Request, Response, NextFunction } from 'express';
import { createTag, getTags, getTagById, updateTag, deleteTag, getTagBySlug } from '../services/tag.service';
import { CreateTagRequest, UpdateTagRequest } from '../types/tag.types';
import { 
  createTagSchemaValidation, 
  updateTagSchemaValidation, 
  getTagsSchemaValidation, 
  getTagByIdSchemaValidation,
  getTagBySlugSchemaValidation,
  deleteTagSchemaValidation 
} from '../validations/tag.validations';

export const createTagHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = createTagSchemaValidation.safeParse(req);
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

    const { lang } = req.params;
    const tagData: CreateTagRequest = req.body;
    
    const tag = await createTag(tagData);
    
    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

export const getTagsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getTagsSchemaValidation.safeParse(req);
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

    const { lang } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    
    const result = await getTags(
      lang,
      Number(page),
      Number(limit),
      search as string
    );
    
    res.json({
      success: true,
      message: 'Tags retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getTagHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getTagByIdSchemaValidation.safeParse(req);
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

    const { id, lang } = req.params;
    
    const tag = await getTagById(Number(id), lang);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Tag retrieved successfully',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

export const getTagBySlugHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getTagBySlugSchemaValidation.safeParse(req);
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

    const { slug, lang } = req.params;
    
    const tag = await getTagBySlug(slug, lang);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Tag retrieved successfully',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

export const updateTagHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = updateTagSchemaValidation.safeParse(req);
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

    const { id } = req.params;
    const updateData: UpdateTagRequest = req.body;
    
    const tag = await updateTag(Number(id), updateData);
    
    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTagHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = deleteTagSchemaValidation.safeParse(req);
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

    const { id } = req.params;
    
    const deleted = await deleteTag(Number(id));
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};