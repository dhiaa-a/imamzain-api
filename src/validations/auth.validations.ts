// src/validations/auth.validations.ts
import { z } from "zod";

export const loginSchema = z.object({
	username: z
		.string()
		.min(1, "Username is required")
		.max(50, "Username must be less than 50 characters"),
	password: z
		.string()
		.min(1, "Password is required")
		.max(100, "Password must be less than 100 characters"),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required").optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;