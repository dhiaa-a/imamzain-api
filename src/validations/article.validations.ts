// src/validations/article.validations.ts
import { Request, Response, NextFunction } from "express";

export function validateCreateArticle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, categoryId, date, translations, attachments } = req.body;
  const errors: string[] = [];

  // Validate slug (now optional)
  if (slug !== undefined) {
    if (typeof slug !== "string") {
      errors.push("Slug must be a string");
    } else if (slug.length < 3) {
      errors.push("Slug must be at least 3 characters long");
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push("Slug can only contain lowercase letters, numbers, and hyphens");
    }
  }

  // Validate categoryId
  if (!categoryId || typeof categoryId !== "number") {
    errors.push("CategoryId is required and must be a number");
  }

  // Validate date
  if (!date || typeof date !== "string") {
    errors.push("Date is required and must be a string");
  } else if (isNaN(Date.parse(date))) {
    errors.push("Date must be a valid ISO date string");
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
      if (!translation.summary || typeof translation.summary !== "string") {
        errors.push(`Translation ${index + 1}: summary is required`);
      }
      if (!translation.body || typeof translation.body !== "string") {
        errors.push(`Translation ${index + 1}: body is required`);
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

export function validateUpdateArticle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, categoryId, date, translations } = req.body;
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

  // Validate categoryId if provided
  if (categoryId !== undefined && typeof categoryId !== "number") {
    errors.push("CategoryId must be a number");
  }

  // Validate date if provided
  if (date !== undefined) {
    if (typeof date !== "string") {
      errors.push("Date must be a string");
    } else if (isNaN(Date.parse(date))) {
      errors.push("Date must be a valid ISO date string");
    }
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
        if (!translation.summary || typeof translation.summary !== "string") {
          errors.push(`Translation ${index + 1}: summary is required`);
        }
        if (!translation.body || typeof translation.body !== "string") {
          errors.push(`Translation ${index + 1}: body is required`);
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