// src/validations/book.validations.ts
import { Request, Response, NextFunction } from "express";

export function validateCreateBook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, pages, parts, partNumber, totalParts, categoryId, translations, attachments } = req.body;
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

  // Validate required number fields
  if (!pages || typeof pages !== "number" || pages <= 0) {
    errors.push("Pages is required and must be a positive number");
  }

  if (!parts || typeof parts !== "number" || parts <= 0) {
    errors.push("Parts is required and must be a positive number");
  }

  if (partNumber === undefined || typeof partNumber !== "number" || partNumber <= 0) {
    errors.push("PartNumber is required and must be a positive number");
  }

  if (!totalParts || typeof totalParts !== "number" || totalParts <= 0) {
    errors.push("TotalParts is required and must be a positive number");
  }

  // Validate part number logic
  if (partNumber && totalParts && partNumber > totalParts) {
    errors.push("PartNumber cannot be greater than totalParts");
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
      if (!translation.author || typeof translation.author !== "string") {
        errors.push(`Translation ${index + 1}: author is required`);
      }
      if (!translation.printHouse || typeof translation.printHouse !== "string") {
        errors.push(`Translation ${index + 1}: printHouse is required`);
      }
      if (!translation.printDate || typeof translation.printDate !== "string") {
        errors.push(`Translation ${index + 1}: printDate is required`);
      }
      if (!translation.series || typeof translation.series !== "string") {
        errors.push(`Translation ${index + 1}: series is required`);
      }
      if (typeof translation.isDefault !== "boolean") {
        errors.push(`Translation ${index + 1}: isDefault must be a boolean`);
      }
      if (translation.names !== undefined && !Array.isArray(translation.names)) {
        errors.push(`Translation ${index + 1}: names must be an array`);
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
        } else if (!["cover", "pdf", "other"].includes(attachment.type)) {
          errors.push(`Attachment ${index + 1}: type must be one of: cover, pdf, other`);
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

export function validateUpdateBook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { slug, pages, parts, partNumber, totalParts, categoryId, translations, attachments } = req.body;
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

  // Validate number fields if provided
  if (pages !== undefined && (typeof pages !== "number" || pages <= 0)) {
    errors.push("Pages must be a positive number");
  }

  if (parts !== undefined && (typeof parts !== "number" || parts <= 0)) {
    errors.push("Parts must be a positive number");
  }

  if (partNumber !== undefined && (typeof partNumber !== "number" || partNumber <= 0)) {
    errors.push("PartNumber must be a positive number");
  }

  if (totalParts !== undefined && (typeof totalParts !== "number" || totalParts <= 0)) {
    errors.push("TotalParts must be a positive number");
  }

  // Validate part number logic if both are provided
  if (partNumber !== undefined && totalParts !== undefined && partNumber > totalParts) {
    errors.push("PartNumber cannot be greater than totalParts");
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
        if (!translation.author || typeof translation.author !== "string") {
          errors.push(`Translation ${index + 1}: author is required`);
        }
        if (!translation.printHouse || typeof translation.printHouse !== "string") {
          errors.push(`Translation ${index + 1}: printHouse is required`);
        }
        if (!translation.printDate || typeof translation.printDate !== "string") {
          errors.push(`Translation ${index + 1}: printDate is required`);
        }
        if (!translation.series || typeof translation.series !== "string") {
          errors.push(`Translation ${index + 1}: series is required`);
        }
        if (translation.isDefault !== undefined && typeof translation.isDefault !== "boolean") {
          errors.push(`Translation ${index + 1}: isDefault must be a boolean`);
        }
        if (translation.names !== undefined && !Array.isArray(translation.names)) {
          errors.push(`Translation ${index + 1}: names must be an array`);
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
        } else if (!["cover", "pdf", "other"].includes(attachment.type)) {
          errors.push(`Attachment ${index + 1}: type must be one of: cover, pdf, other`);
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

export function validateCreateBookType(
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

export function validateUpdateBookType(
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