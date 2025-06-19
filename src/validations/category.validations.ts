// src/validations/category.validations.ts
import { Request, Response, NextFunction } from "express";
import { SUPPORTED_LANGUAGES } from "../types/language.types";

export function validateCreateCategory(req: Request, res: Response, next: NextFunction): void {
  const { name, slug, translations } = req.body;

  // Validate name (required)
  if (!name || typeof name !== 'string') {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Name is required and must be a string"
      }
    });
    return;
  }

  // Validate name length
  if (name.trim().length < 2 || name.trim().length > 100) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Category name must be between 2 and 100 characters"
      }
    });
    return;
  }

  // Validate slug if provided
  if (slug && (typeof slug !== 'string' || slug.trim().length === 0)) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Slug must be a non-empty string if provided"
      }
    });
    return;
  }

  // Validate translations if provided (optional for future use)
  if (translations) {
    if (!Array.isArray(translations)) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Translations must be an array if provided"
        }
      });
      return;
    }

    // Validate each translation
    for (const translation of translations) {
      if (!translation.languageCode || !translation.name) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Each translation must have languageCode and name"
          }
        });
        return;
      }

      // Validate language code
      const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      if (!supportedCodes.includes(translation.languageCode)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Language code '${translation.languageCode}' is not supported. Supported codes: ${supportedCodes.join(', ')}`
          }
        });
        return;
      }

      // Validate isDefault
      if (typeof translation.isDefault !== 'boolean') {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "isDefault must be a boolean value"
          }
        });
        return;
      }

      // Validate name length
      if (translation.name.trim().length < 2 || translation.name.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category translation name must be between 2 and 100 characters"
          }
        });
        return;
      }

      // Validate description length if provided
      if (translation.description && translation.description.trim().length > 500) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category translation description must not exceed 500 characters"
          }
        });
        return;
      }
    }

    // Check for duplicate language codes
    const languageCodes = translations.map((t: any) => t.languageCode);
    const duplicates = languageCodes.filter((code: string, index: number) => languageCodes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Duplicate language codes found: ${duplicates.join(', ')}`
        }
      });
      return;
    }
  }

  next();
}

export function validateUpdateCategory(req: Request, res: Response, next: NextFunction): void {
  const { name, slug, translations } = req.body;

  // At least one field should be provided for update
  if (!name && !slug && !translations) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "At least one field (name, slug, or translations) must be provided for update"
      }
    });
    return;
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name must be a string if provided"
        }
      });
      return;
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category name must be between 2 and 100 characters"
        }
      });
      return;
    }
  }

  // Validate slug if provided
  if (slug && (typeof slug !== 'string' || slug.trim().length === 0)) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Slug must be a non-empty string if provided"
      }
    });
    return;
  }

  // Validate translations if provided
  if (translations) {
    if (!Array.isArray(translations) || translations.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Translations must be a non-empty array if provided"
        }
      });
      return;
    }

    // Validate each translation
    for (const translation of translations) {
      if (!translation.languageCode || !translation.name) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Each translation must have languageCode and name"
          }
        });
        return;
      }

      // Validate language code
      const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      if (!supportedCodes.includes(translation.languageCode)) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Language code '${translation.languageCode}' is not supported. Supported codes: ${supportedCodes.join(', ')}`
          }
        });
        return;
      }

      // Validate isDefault if provided
      if (translation.isDefault !== undefined && typeof translation.isDefault !== 'boolean') {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "isDefault must be a boolean value if provided"
          }
        });
        return;
      }

      // Validate name length
      if (translation.name.trim().length < 2 || translation.name.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category translation name must be between 2 and 100 characters"
          }
        });
        return;
      }

      // Validate description length if provided
      if (translation.description && translation.description.trim().length > 500) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Category translation description must not exceed 500 characters"
          }
        });
        return;
      }
    }

    // Check for duplicate language codes
    const languageCodes = translations.map((t: any) => t.languageCode);
    const duplicates = languageCodes.filter((code: string, index: number) => languageCodes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Duplicate language codes found: ${duplicates.join(', ')}`
        }
      });
      return;
    }
  }

  next();
}