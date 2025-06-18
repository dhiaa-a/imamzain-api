// src/validations/attachment.validations.ts
import { Request, Response, NextFunction } from "express";
import { ALLOWED_MIME_TYPES } from "../types/attachment.types";

export function validateCreateAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { originalName, fileName, path, mimeType, size } = req.body;
  const errors: string[] = [];

  // Validate required fields
  if (!originalName || typeof originalName !== "string") {
    errors.push("originalName is required and must be a string");
  }

  if (!fileName || typeof fileName !== "string") {
    errors.push("fileName is required and must be a string");
  }

  if (!path || typeof path !== "string") {
    errors.push("path is required and must be a string");
  }

  if (!mimeType || typeof mimeType !== "string") {
    errors.push("mimeType is required and must be a string");
  } else if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    errors.push(`mimeType must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }

  if (size === undefined || typeof size !== "number" || size <= 0) {
    errors.push("size is required and must be a positive number");
  }

  // Validate optional fields
  if (req.body.disk !== undefined && typeof req.body.disk !== "string") {
    errors.push("disk must be a string");
  }

  if (req.body.collection !== undefined && typeof req.body.collection !== "string") {
    errors.push("collection must be a string");
  }

  if (req.body.altText !== undefined && typeof req.body.altText !== "string") {
    errors.push("altText must be a string");
  }

  if (req.body.metadata !== undefined && typeof req.body.metadata !== "object") {
    errors.push("metadata must be an object");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors
      }
    });
    return;
  }

  next();
}

export function validateUpdateAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { originalName, fileName, path, mimeType, size } = req.body;
  const errors: string[] = [];

  // Validate optional fields if provided
  if (originalName !== undefined && typeof originalName !== "string") {
    errors.push("originalName must be a string");
  }

  if (fileName !== undefined && typeof fileName !== "string") {
    errors.push("fileName must be a string");
  }

  if (path !== undefined && typeof path !== "string") {
    errors.push("path must be a string");
  }

  if (mimeType !== undefined) {
    if (typeof mimeType !== "string") {
      errors.push("mimeType must be a string");
    } else if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      errors.push(`mimeType must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`);
    }
  }

  if (size !== undefined && (typeof size !== "number" || size <= 0)) {
    errors.push("size must be a positive number");
  }

  if (req.body.disk !== undefined && typeof req.body.disk !== "string") {
    errors.push("disk must be a string");
  }

  if (req.body.collection !== undefined && typeof req.body.collection !== "string") {
    errors.push("collection must be a string");
  }

  if (req.body.altText !== undefined && typeof req.body.altText !== "string") {
    errors.push("altText must be a string");
  }

  if (req.body.metadata !== undefined && typeof req.body.metadata !== "object") {
    errors.push("metadata must be an object");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors
      }
    });
    return;
  }

  next();
}

export function validateArticleAttachments(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { attachments } = req.body;
  const errors: string[] = [];

  if (!attachments || !Array.isArray(attachments)) {
    errors.push("attachments must be an array");
  } else {
    attachments.forEach((attachment, index) => {
      if (!attachment.attachmentId || typeof attachment.attachmentId !== "number") {
        errors.push(`Attachment ${index + 1}: attachmentId is required and must be a number`);
      }

      if (!attachment.type || typeof attachment.type !== "string") {
        errors.push(`Attachment ${index + 1}: type is required and must be a string`);
      } else if (!["image", "attachment", "other"].includes(attachment.type)) {
        errors.push(`Attachment ${index + 1}: type must be one of: image, attachment, other`);
      }

      if (attachment.order === undefined || typeof attachment.order !== "number") {
        errors.push(`Attachment ${index + 1}: order is required and must be a number`);
      }
    });

    // Check for duplicate attachment IDs
    const attachmentIds = attachments.map(a => a.attachmentId);
    const duplicateIds = attachmentIds.filter((id, index) => attachmentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate attachment IDs found: ${duplicateIds.join(", ")}`);
    }

    // Check for duplicate orders
    const orders = attachments.map(a => a.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      errors.push(`Duplicate order values found: ${duplicateOrders.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors
      }
    });
    return;
  }

  next();
}