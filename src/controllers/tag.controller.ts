import { Request, Response, NextFunction } from 'express';
import { createTag, getTags, getTagById, updateTag, deleteTag, getTagBySlug } from '../services/tag.service';
import { CreateTagRequest, UpdateTagRequest } from '../types/tag.types';

export const createTagHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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