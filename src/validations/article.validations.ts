// src/validations/article.validations.ts
import { Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "../types/language.types";

// Get supported language codes
const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);

// Zod schemas
const createArticleTranslationSchema = z.object({
  languageCode: z.enum(supportedLanguageCodes as [string, ...string[]], {
    errorMap: () => ({ 
      message: `Language code must be one of: ${supportedLanguageCodes.join(', ')}` 
    })
  }),
  isDefault: z.boolean({
    required_error: "isDefault is required",
    invalid_type_error: "isDefault must be a boolean"
  }),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }).min(3, "Title must be at least 3 characters long").trim(),
  summary: z.string({
    invalid_type_error: "Summary must be a string"
  }).optional(),
  body: z.string({
    required_error: "Body is required",
    invalid_type_error: "Body must be a string"
  }).min(10, "Body must be at least 10 characters long").trim()
});

const updateArticleTranslationSchema = z.object({
  id: z.number().int().positive().optional(),
  languageCode: z.enum(supportedLanguageCodes as [string, ...string[]], {
    errorMap: () => ({ 
      message: `Language code must be one of: ${supportedLanguageCodes.join(', ')}` 
    })
  }),
  isDefault: z.boolean({
    invalid_type_error: "isDefault must be a boolean"
  }).optional(),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string"
  }).min(3, "Title must be at least 3 characters long").trim(),
  summary: z.string({
    invalid_type_error: "Summary must be a string"
  }).optional(),
  body: z.string({
    required_error: "Body is required",
    invalid_type_error: "Body must be a string"
  }).min(10, "Body must be at least 10 characters long").trim()
});

const articleAttachmentSchema = z.object({
  attachmentId: z.number({
    required_error: "attachmentId is required",
    invalid_type_error: "attachmentId must be a number"
  }).int().positive("attachmentId must be a positive integer"),
  type: z.enum(["featured", "gallery", "attachment", "other"], {
    errorMap: () => ({ 
      message: "Type must be one of: featured, gallery, attachment, other" 
    })
  }),
  order: z.number({
    required_error: "Order is required",
    invalid_type_error: "Order must be a number"
  }).int().min(0, "Order must be a non-negative integer")
});

const createArticleSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  categoryId: z.number({
    required_error: "CategoryId is required",
    invalid_type_error: "CategoryId must be a number"
  }).int().positive("CategoryId must be a positive integer"),
  date: z.string()
    .datetime("Date must be a valid ISO date string")
    .optional(),
  translations: z.array(createArticleTranslationSchema, {
    required_error: "Translations are required",
    invalid_type_error: "Translations must be an array"
  }).min(1, "At least one translation is required"),
  attachments: z.array(articleAttachmentSchema).optional()
}).refine((data) => {
  // Check exactly one default translation
  const defaultCount = data.translations.filter(t => t.isDefault).length;
  return defaultCount === 1;
}, {
  message: "Exactly one translation must be marked as default",
  path: ["translations"]
}).refine((data) => {
  // Check for duplicate language codes
  const languageCodes = data.translations.map(t => t.languageCode);
  const uniqueLanguageCodes = new Set(languageCodes);
  return uniqueLanguageCodes.size === languageCodes.length;
}, {
  message: "Duplicate language codes found",
  path: ["translations"]
}).refine((data) => {
  // Check for duplicate attachment IDs
  if (!data.attachments || data.attachments.length === 0) return true;
  const attachmentIds = data.attachments.map(a => a.attachmentId);
  const uniqueAttachmentIds = new Set(attachmentIds);
  return uniqueAttachmentIds.size === attachmentIds.length;
}, {
  message: "Duplicate attachment IDs found",
  path: ["attachments"]
}).refine((data) => {
  // Check for duplicate attachment orders
  if (!data.attachments || data.attachments.length === 0) return true;
  const orders = data.attachments.map(a => a.order);
  const uniqueOrders = new Set(orders);
  return uniqueOrders.size === orders.length;
}, {
  message: "Duplicate attachment order values found",
  path: ["attachments"]
});

const updateArticleSchema = z.object({
  slug: z.string()
    .min(3, "Slug must be at least 3 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  categoryId: z.number({
    invalid_type_error: "CategoryId must be a number"
  }).int().positive("CategoryId must be a positive integer").optional(),
  date: z.string()
    .datetime("Date must be a valid ISO date string")
    .optional(),
  translations: z.array(updateArticleTranslationSchema).min(1, "At least one translation is required when updating translations").optional(),
  attachments: z.array(articleAttachmentSchema).optional()
}).refine((data) => {
  // At least one field must be provided
  return data.slug !== undefined || 
         data.categoryId !== undefined || 
         data.date !== undefined || 
         data.translations !== undefined || 
         data.attachments !== undefined;
}, {
  message: "At least one field must be provided for update"
}).refine((data) => {
  // Check at most one default translation
  if (!data.translations) return true;
  const defaultCount = data.translations.filter(t => t.isDefault).length;
  return defaultCount <= 1;
}, {
  message: "At most one translation can be marked as default",
  path: ["translations"]
}).refine((data) => {
  // Check for duplicate language codes
  if (!data.translations) return true;
  const languageCodes = data.translations.map(t => t.languageCode);
  const uniqueLanguageCodes = new Set(languageCodes);
  return uniqueLanguageCodes.size === languageCodes.length;
}, {
  message: "Duplicate language codes found",
  path: ["translations"]
}).refine((data) => {
  // Check for duplicate attachment IDs
  if (!data.attachments || data.attachments.length === 0) return true;
  const attachmentIds = data.attachments.map(a => a.attachmentId);
  const uniqueAttachmentIds = new Set(attachmentIds);
  return uniqueAttachmentIds.size === attachmentIds.length;
}, {
  message: "Duplicate attachment IDs found",
  path: ["attachments"]
}).refine((data) => {
  // Check for duplicate attachment orders
  if (!data.attachments || data.attachments.length === 0) return true;
  const orders = data.attachments.map(a => a.order);
  const uniqueOrders = new Set(orders);
  return uniqueOrders.size === orders.length;
}, {
  message: "Duplicate attachment order values found",
  path: ["attachments"]
});

// Validation middleware functions
=======

>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
export function validateCreateArticle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
<<<<<<< HEAD
  try {
    createArticleSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      });

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

    // Handle unexpected errors
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during validation"
      }
    });
  }
=======
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
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
}

export function validateUpdateArticle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
<<<<<<< HEAD
  try {
    updateArticleSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      });

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

    // Handle unexpected errors
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during validation"
      }
    });
  }
}

// Export schemas for potential reuse
export { 
  createArticleSchema, 
  updateArticleSchema, 
  createArticleTranslationSchema, 
  updateArticleTranslationSchema, 
  articleAttachmentSchema 
};
=======
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
>>>>>>> b3efe0ab36e924e0d59cc919eff252908792b26c
