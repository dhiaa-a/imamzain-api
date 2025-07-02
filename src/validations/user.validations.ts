import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Validation schemas
const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number"),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required").max(255, "Full name too long"),
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username too long")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long"),
    roles: z
      .array(z.number().int().positive("Role ID must be a positive integer"))
      .min(1, "At least one role is required"),
  }),
});

const updateUserActiveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number"),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

const updateUserRolesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number"),
  }),
  body: z.object({
    roles: z
      .array(z.number().int().positive("Role ID must be a positive integer"))
      .min(1, "At least one role is required"),
  }),
});

// Validation middleware functions
export function validateGetUserById(req: Request, res: Response, next: NextFunction): void {
  try {
    getUserByIdSchema.parse({ params: req.params });
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.errors,
      },
    });
  }
}

export function validateCreateUser(req: Request, res: Response, next: NextFunction): void {
  try {
    createUserSchema.parse({ body: req.body });
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.errors,
      },
    });
  }
}

export function validateUpdateUserActive(req: Request, res: Response, next: NextFunction): void {
  try {
    updateUserActiveSchema.parse({ params: req.params, body: req.body });
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.errors,
      },
    });
  }
}

export function validateUpdateUserRoles(req: Request, res: Response, next: NextFunction): void {
  try {
    updateUserRolesSchema.parse({ params: req.params, body: req.body });
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.errors,
      },
    });
  }
}

// Type exports
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserActiveInput = z.infer<typeof updateUserActiveSchema>;
export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;