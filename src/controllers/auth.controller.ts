import { Request, Response, NextFunction } from "express"
import {
	loginUser,
	logoutUser,
	refreshAccessToken,
} from "../services/auth.service"

export async function login(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const { username, password } = req.body
	if (!username || !password) {
		res.status(400).json({
			success: false,
			error: {
				code: "BAD_REQUEST",
				message: "Username and password required",
			},
		})
		return
	}

	try {
		const { user, tokens } = await loginUser(username, password)

		// set HTTP-only cookie for refresh
		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 1000 * 60 * 60 * 24, // e.g. 1 day
		})

		res.json({ success: true, data: { token: tokens.accessToken, user } })
	} catch (err: any) {
		const code = err.message === "UNAUTHORIZED" ? 401 : 500
		res.status(code).json({
			success: false,
			error: {
				code: err.message,
				message:
					err.message === "UNAUTHORIZED"
						? "Invalid credentials"
						: "Server error",
			},
		})
	}
}

export async function refreshToken(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const token = req.cookies.refreshToken
	if (!token) {
		res.status(401).json({
			success: false,
			error: { code: "UNAUTHORIZED", message: "No refresh token" },
		})
		return
	}

	try {
		const { accessToken } = await refreshAccessToken(token)
		res.json({ success: true, data: { token: accessToken } })
	} catch (err: any) {
		const code = err.message === "INVALID_REFRESH_TOKEN" ? 403 : 500
		res.status(code).json({
			success: false,
			error: {
				code: err.message,
				message:
					err.message === "INVALID_REFRESH_TOKEN"
						? "Invalid or revoked refresh token"
						: "Server error",
			},
		})
	}
}

export async function logout(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const token = req.cookies.refreshToken
	try {
		await logoutUser(token)
		res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" })
		res.json({ success: true, message: "Logged out" })
	} catch (err) {
		next(err)
	}
}
