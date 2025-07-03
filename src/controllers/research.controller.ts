import { Request, Response, NextFunction } from 'express';
import { 
  createResearchSchemaValidation,
  updateResearchSchemaValidation,
  getResearchSchemaValidation,
  getResearchBySlugSchemaValidation,
  getResearchesSchemaValidation,
  deleteResearchSchemaValidation
} from '../validations/research.validations';
import { 
  createResearch,
  getResearches,
  getResearchById,
  getResearchBySlug,
  updateResearch,
  deleteResearch
} from '../services/research.service';

export const createResearchHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = createResearchSchemaValidation.safeParse(req);
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

    const result = await createResearch(req.body);
    res.status(201).json({
      success: true,
      message: 'Research created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getResearchesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getResearchesSchemaValidation.safeParse(req);
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
    const { page, limit, categoryId, tagIds, search, isPublished, publishedYear } = validationResult.data.query;
    
    const filters = { categoryId, tagIds, search, isPublished, publishedYear };
    const result = await getResearches(lang, filters, page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Researches retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getResearchByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getResearchSchemaValidation.safeParse(req);
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
    const result = await getResearchById(id, lang);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Research not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Research retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getResearchBySlugHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = getResearchBySlugSchemaValidation.safeParse(req);
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
    const result = await getResearchBySlug(slug, lang);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Research not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Research retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateResearchHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = updateResearchSchemaValidation.safeParse(req);
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
    const result = await updateResearch(id, req.body);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Research not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Research updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResearchHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validationResult = deleteResearchSchemaValidation.safeParse(req);
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
    const result = await deleteResearch(id);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Research not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Research deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};