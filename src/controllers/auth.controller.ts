// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { loginUser, logoutUser, refreshAccessToken } from "../services/auth.service";
import { LoginRequest } from "../validations/auth.validations";
import { ApiResponse, ErrorResponse } from "../types/error.types";
import { LoginResponse, RefreshTokenResponse } from "../types/auth.types";

export async function login(
	req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>,
	res: Response<ApiResponse<LoginResponse>>,
	next: NextFunction,
): Promise<void> {
	try {
		const { username, password } = req.body;
		const { user, tokens } = await loginUser(username, password);

		// Set HTTP-only cookie for refresh token
		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
		});

		res.json({
			success: true,
			data: {
				token: tokens.accessToken,
				user,
			},
		});
	} catch (err: any) {
		const statusCode = err.message === "UNAUTHORIZED" ? 401 : 500;
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: err.message === "UNAUTHORIZED" ? "UNAUTHORIZED" : "INTERNAL_ERROR",
				message: err.message === "UNAUTHORIZED" ? "Invalid credentials" : "Server error",
			},
		};

		res.status(statusCode).json(errorResponse);
	}
}

export async function refreshToken(
	req: Request,
	res: Response<ApiResponse<RefreshTokenResponse>>,
	next: NextFunction,
): Promise<void> {
	try {
		const token = req.cookies.refreshToken;
		
		if (!token) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "UNAUTHORIZED",
					message: "No refresh token provided",
				},
			};
			res.status(401).json(errorResponse);
			return;
		}

		const { accessToken } = await refreshAccessToken(token);
		
		res.json({
			success: true,
			data: {
				token: accessToken,
			},
		});
	} catch (err: any) {
		const statusCode = err.message === "INVALID_REFRESH_TOKEN" ? 403 : 500;
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: err.message === "INVALID_REFRESH_TOKEN" ? "INVALID_REFRESH_TOKEN" : "INTERNAL_ERROR",
				message: err.message === "INVALID_REFRESH_TOKEN" 
					? "Invalid or expired refresh token" 
					: "Server error",
			},
		};

		res.status(statusCode).json(errorResponse);
	}
}

export async function logout(
	req: Request,
	res: Response<ApiResponse>,
	next: NextFunction,
): Promise<void> {
	try {
		const token = req.cookies.refreshToken;
		
		await logoutUser(token);
		
		res.clearCookie("refreshToken", {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (err) {
		next(err);
	}
}