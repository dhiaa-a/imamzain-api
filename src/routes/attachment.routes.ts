// src/routes/attachment.routes.ts
import { Router } from "express";
import {
  uploadFileHandler,
  getAttachmentHandler,
  getAttachmentsHandler,
  updateAttachmentHandler,
  deleteAttachmentHandler,
  serveFileHandler,
  upload
} from "../controllers/attachment.controller";
import { authorize, authenticateJWT } from "../middlewares/auth.middleware";
import { validateCreateAttachment, validateUpdateAttachment, validateArticleAttachments } from "../validations/attachment.validations";

const attachmentRouter = Router();

// Serve uploaded files (public access)
attachmentRouter.get("/uploads/:filename", serveFileHandler);

// Get all attachments (public read access)
attachmentRouter.get("/", getAttachmentsHandler);

// Get attachment by ID (public read access)
attachmentRouter.get("/:id", getAttachmentHandler);

// Upload file (requires authentication + permission)
attachmentRouter.post("/upload", 
  authenticateJWT,
  authorize("CREATE_ATTACHMENTS"),
  upload.single('file'),
  uploadFileHandler
);

// Update attachment (requires authentication + permission)
attachmentRouter.put("/:id", 
  authenticateJWT,
  authorize("UPDATE_ATTACHMENTS"),
  validateUpdateAttachment,
  updateAttachmentHandler
);

// Delete attachment (requires authentication + permission)
attachmentRouter.delete("/:id", 
  authenticateJWT,
  authorize("DELETE_ATTACHMENTS"),
  deleteAttachmentHandler
);

export default attachmentRouter;