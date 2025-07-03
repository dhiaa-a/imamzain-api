import { Request, Response } from 'express';
import { z } from 'zod';
import { 
  createAttachment,
  getAttachmentById,
  getAllAttachments,
  updateAttachment,
  deleteAttachment,
  createUploadDirectories,
  getFileTypeDirectory
} from '../services/attachment.service';
import { AttachmentFilters } from '../types/attachment.types';
import { 
  createAttachmentSchema,
  updateAttachmentSchema,
  getAttachmentSchema,
  deleteAttachmentSchema
} from '../validations/attachment.validations';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateSlug } from '../utils/slug.utils';

// Initialize upload directories
createUploadDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileTypeDir = getFileTypeDirectory(file.mimetype);
    const uploadPath = path.join(process.cwd(), 'uploads', fileTypeDir);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const sluggedName = generateSlug(baseName);
    
    const fileName = `${timestamp}-${randomString}-${sluggedName}${extension}`;
    cb(null, fileName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Add any file type restrictions here if needed
    cb(null, true);
  }
});

export const createHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
        errors: [{
          field: 'file',
          message: 'File is required'
        }]
      });
      return;
    }

    // Validate request using schema
    const validationResult = createAttachmentSchema.safeParse(req);
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

    // Generate HTTP URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const fileTypeDir = getFileTypeDirectory(req.file.mimetype);
    const fileUrl = `${baseUrl}/uploads/${fileTypeDir}/${req.file.filename}`;

    const attachmentData = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: fileUrl, // Store HTTP URL instead of file system path
      mimeType: req.file.mimetype,
      size: req.file.size,
      altText: req.body.altText || null,
      metadata: validationResult.data.body.metadata || null
    };

    const attachment = await createAttachment(attachmentData);

    res.status(201).json({
      success: true,
      message: 'Attachment created successfully',
      data: attachment
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const getByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request using schema
    const validationResult = getAttachmentSchema.safeParse(req);
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

    const id = validationResult.data.params.id;
    const attachment = await getAttachmentById(id);

    if (!attachment) {
      res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: attachment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const getAllHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters: AttachmentFilters = {};
    
    if (req.query.mimeType) {
      filters.mimeType = req.query.mimeType as string;
    }
    if (req.query.originalName) {
      filters.originalName = req.query.originalName as string;
    }
    if (req.query.minSize) {
      filters.minSize = parseInt(req.query.minSize as string);
    }
    if (req.query.maxSize) {
      filters.maxSize = parseInt(req.query.maxSize as string);
    }
    if (req.query.createdAfter) {
      filters.createdAfter = new Date(req.query.createdAfter as string);
    }
    if (req.query.createdBefore) {
      filters.createdBefore = new Date(req.query.createdBefore as string);
    }

    const result = await getAllAttachments(page, limit, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const updateHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request using schema
    const validationResult = updateAttachmentSchema.safeParse(req);
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

    const id = validationResult.data.params.id;
    const updateData = validationResult.data.body;

    const attachment = await updateAttachment(id, updateData);

    if (!attachment) {
      res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Attachment updated successfully',
      data: attachment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const deleteHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request using schema
    const validationResult = deleteAttachmentSchema.safeParse(req);
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

    const id = validationResult.data.params.id;
    const deleted = await deleteAttachment(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

export const downloadHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request using schema
    const validationResult = getAttachmentSchema.safeParse(req);
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

    const id = validationResult.data.params.id;
    const attachment = await getAttachmentById(id);

    if (!attachment) {
      res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
      return;
    }

    // Convert HTTP URL back to file system path
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const relativePath = attachment.path.replace(baseUrl, '');
    const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ''));

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Physical file not found'
      });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimeType);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};