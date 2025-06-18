// src/validations/research.validations.ts
import { Request, Response, NextFunction } from "express";

export function validateCreateResearch(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, date, pages, categoryId, translations, attachments } = req.body;
  const errors: string[] = [];

  // Validate slug (optional)
  if (slug !== undefined) {
    if (typeof slug !== "string") {
      errors.push("Slug must be a string");
    } else if (slug.length < 3) {
      errors.push("Slug must be at least 3 characters long");
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push("Slug can only contain lowercase letters, numbers, and hyphens");
    }
  }

  // Validate date
  if (!date || typeof date !== "string") {
    errors.push("Date is required and must be a string");
  } else if (isNaN(Date.parse(date))) {
    errors.push("Date must be a valid ISO date string");
  }

  // Validate pages
  if (!pages || typeof pages !== "number" || pages <= 0) {
    errors.push("Pages is required and must be a positive number");
  }

  // Validate categoryId
  if (!categoryId || typeof categoryId !== "number") {
    errors.push("CategoryId is required and must be a number");
  }

  // Validate translations
  if (!translations || !Array.isArray(translations)) {
    errors.push("Translations are required and must be an array");
  } else if (translations.length === 0) {
    errors.push("At least one translation is required");
  } else {
    translations.forEach((translation, index) => {
      if (!translation.languageCode || typeof translation.languageCode !== "string") {
        errors.push(`Translation ${index + 1}: languageCode is required`);
      }
      if (!translation.title || typeof translation.title !== "string") {
        errors.push(`Translation ${index + 1}: title is required`);
      }
      if (!translation.abstract || typeof translation.abstract !== "string") {
        errors.push(`Translation ${index + 1}: abstract is required`);
      }
      if (typeof translation.isDefault !== "boolean") {
        errors.push(`Translation ${index + 1}: isDefault must be a boolean`);
      }
    });

    // Check for exactly one default translation
    const defaultCount = translations.filter(t => t.isDefault).length;
    if (defaultCount !== 1) {
      errors.push("Exactly one translation must be marked as default");
    }
  }

  // Validate attachments (optional)
  if (attachments !== undefined) {
    if (!Array.isArray(attachments)) {
      errors.push("Attachments must be an array");
    } else {
      attachments.forEach((attachment, index) => {
        if (!attachment.attachmentId || typeof attachment.attachmentId !== "number") {
          errors.push(`Attachment ${index + 1}: attachmentId is required and must be a number`);
        }

        if (!attachment.type || typeof attachment.type !== "string") {
          errors.push(`Attachment ${index + 1}: type is required and must be a string`);
        } else if (!["pdf", "image", "other"].includes(attachment.type)) {
          errors.push(`Attachment ${index + 1}: type must be one of: pdf, image, other`);
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
        errors.push(`Duplicate attachment order values found: ${duplicateOrders.join(", ")}`);
      }
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

export function validateUpdateResearch(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, date, pages, categoryId, translations, attachments } = req.body;
  const errors: string[] = [];

  // Validate slug if provided
  if (slug !== undefined) {
    if (typeof slug !== "string") {
      errors.push("Slug must be a string");
    } else if (slug.length < 3) {
      errors.push("Slug must be at least 3 characters long");
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push("Slug can only contain lowercase letters, numbers, and hyphens");
    }
  }

  // Validate date if provided
  if (date !== undefined) {
    if (typeof date !== "string") {
      errors.push("Date must be a string");
    } else if (isNaN(Date.parse(date))) {
      errors.push("Date must be a valid ISO date string");
    }
  }

  // Validate pages if provided
  if (pages !== undefined && (typeof pages !== "number" || pages <= 0)) {
    errors.push("Pages must be a positive number");
  }

  // Validate categoryId if provided
  if (categoryId !== undefined && typeof categoryId !== "number") {
    errors.push("CategoryId must be a number");
  }

  // Validate translations if provided
  if (translations !== undefined) {
    if (!Array.isArray(translations)) {
      errors.push("Translations must be an array");
    } else if (translations.length === 0) {
      errors.push("At least one translation is required when updating translations");
    } else {
      translations.forEach((translation, index) => {
        if (!translation.languageCode || typeof translation.languageCode !== "string") {
          errors.push(`Translation ${index + 1}: languageCode is required`);
        }
        if (!translation.title || typeof translation.title !== "string") {
          errors.push(`Translation ${index + 1}: title is required`);
        }
        if (!translation.abstract || typeof translation.abstract !== "string") {
          errors.push(`Translation ${index + 1}: abstract is required`);
        }
        if (translation.isDefault !== undefined && typeof translation.isDefault !== "boolean") {
          errors.push(`Translation ${index + 1}: isDefault must be a boolean`);
        }
      });

      // Check for at most one default translation
      const defaultCount = translations.filter(t => t.isDefault).length;
      if (defaultCount > 1) {
        errors.push("At most one translation can be marked as default");
      }
    }
  }

  // Validate attachments if provided
  if (attachments !== undefined) {
    if (!Array.isArray(attachments)) {
      errors.push("Attachments must be an array");
    } else {
      attachments.forEach((attachment, index) => {
        if (!attachment.attachmentId || typeof attachment.attachmentId !== "number") {
          errors.push(`Attachment ${index + 1}: attachmentId is required and must be a number`);
        }

        if (!attachment.type || typeof attachment.type !== "string") {
          errors.push(`Attachment ${index + 1}: type is required and must be a string`);
        } else if (!["pdf", "image", "other"].includes(attachment.type)) {
          errors.push(`Attachment ${index + 1}: type must be one of: pdf, image, other`);
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
        errors.push(`Duplicate attachment order values found: ${duplicateOrders.join(", ")}`);
      }
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

export function validateCreateResearchCategory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, name } = req.body;
  const errors: string[] = [];

  // Validate slug
  if (!slug || typeof slug !== "string") {
    errors.push("Slug is required and must be a string");
  } else if (slug.length < 2) {
    errors.push("Slug must be at least 2 characters long");
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push("Slug can only contain lowercase letters, numbers, and hyphens");
  }

  // Validate name
  if (!name || typeof name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (name.length < 2) {
    errors.push("Name must be at least 2 characters long");
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

export function validateUpdateResearchCategory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, name } = req.body;
  const errors: string[] = [];

  // Validate slug if provided
  if (slug !== undefined) {
    if (typeof slug !== "string") {
      errors.push("Slug must be a string");
    } else if (slug.length < 2) {
      errors.push("Slug must be at least 2 characters long");
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push("Slug can only contain lowercase letters, numbers, and hyphens");
    }
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== "string") {
      errors.push("Name must be a string");
    } else if (name.length < 2) {
      errors.push("Name must be at least 2 characters long");
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