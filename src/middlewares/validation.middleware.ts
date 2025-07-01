import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ErrorResponse } from "../types/error.types";

interface ValidationSchemas {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate params if schema provided
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate query if schema provided
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: errors,
          },
        };

        res.status(400).json(errorResponse);
        return;
      }

      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      };

      res.status(500).json(errorResponse);
    }
  };
}

// Keep the original validate function for backward compatibility
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: errors,
          },
        };

        res.status(400).json(errorResponse);
        return;
      }

      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      };

      res.status(500).json(errorResponse);
    }
  };
}