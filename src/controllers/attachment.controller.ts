// src/controllers/attachment.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createAttachment,
  getAttachmentById,
  getAttachments,
  updateAttachment,
  deleteAttachment
} from "../services/attachment.service";
import { 
  CreateAttachmentRequest, 
  UpdateAttachmentRequest,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
} from "../types/attachment.types";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Extend Request interface to include file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

export async function uploadFileHandler(
  req: RequestWithFile,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "No file uploaded"
        }
      });
      return;
    }

    const { collection, altText, metadata } = req.body;

    const attachmentData: CreateAttachmentRequest = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.filename, // Store relative path
      mimeType: req.file.mimetype,
      size: req.file.size,
      disk: 'local',
      collection: collection || null,
      altText: altText || null,
      metadata: metadata ? JSON.parse(metadata) : {}
    };

    const attachment = await createAttachment(attachmentData);

    res.status(201).json({
      success: true,
      data: attachment,
      message: "File uploaded successfully"
    });
  } catch (error: any) {
    // Clean up uploaded file if database operation fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Failed to clean up uploaded file:", e);
      }
    }
    next(error);
  }
}

export async function getAttachmentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const attachmentId = parseInt(id);

    if (isNaN(attachmentId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid attachment ID"
        }
      });
      return;
    }

    const attachment = await getAttachmentById(attachmentId);

    if (!attachment) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Attachment not found"
        }
      });
      return;
    }

    res.json({
      success: true,
      data: attachment
    });
  } catch (error) {
    next(error);
  }
}

export async function getAttachmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page = "1",
      limit = "20",
      mimeType,
      collection,
      search,
      disk
    } = req.query;

    const query = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      mimeType: mimeType as string,
      collection: collection as string,
      search: search as string,
      disk: disk as string
    };

    const result = await getAttachments(query);

    res.json({
      success: true,
      data: result.attachments,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAttachmentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: UpdateAttachmentRequest = req.body;

    const attachmentId = parseInt(id);
    if (isNaN(attachmentId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid attachment ID"
        }
      });
      return;
    }

    const attachment = await updateAttachment(attachmentId, updateData);

    res.json({
      success: true,
      data: attachment
    });
  } catch (error: any) {
    if (error.message === "ATTACHMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Attachment not found"
        }
      });
      return;
    }
    next(error);
  }
}

export async function deleteAttachmentHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const attachmentId = parseInt(id);

    if (isNaN(attachmentId)) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid attachment ID"
        }
      });
      return;
    }

    await deleteAttachment(attachmentId);

    res.json({
      success: true,
      message: "Attachment deleted successfully"
    });
  } catch (error: any) {
    if (error.message === "ATTACHMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Attachment not found"
        }
      });
      return;
    }
    
    if (error.message === "ATTACHMENT_IN_USE") {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Cannot delete attachment as it is being used by articles, research, or books"
        }
      });
      return;
    }
    
    next(error);
  }
}

export async function serveFileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "File not found"
        }
      });
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}