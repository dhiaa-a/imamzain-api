// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"

export function errorHandler(
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error(err)

	// 1) Zod validation errors
	if (err instanceof ZodError) {
		const details = err.errors.map((e) => ({
			path: e.path.join("."),
			message: e.message,
		}))
		res.status(400).json({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Validation failed",
				details,
			},
		})
		return
	}

	// 2) Prisma client errors
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// Unique constraint violation
		if (err.code === "P2002") {
			res.status(409).json({
				success: false,
				error: {
					code: "CONFLICT",
					message: "Duplicate record",
					meta: err.meta,
				},
			})
			return
		}
		// Record not found
		if (err.code === "P2025") {
			res.status(404).json({
				success: false,
				error: {
					code: "NOT_FOUND",
					message: "Record not found",
				},
			})
			return
		}
		// Other Prisma errors
		res.status(400).json({
			success: false,
			error: {
				code: err.code,
				message: err.message,
			},
		})
		return
	}

	// 3) JWT errors
	if (err.name === "JsonWebTokenError") {
		res.status(401).json({
			success: false,
			error: {
				code: "INVALID_TOKEN",
				message: err.message,
			},
		})
		return
	}
	if (err.name === "TokenExpiredError") {
		res.status(401).json({
			success: false,
			error: {
				code: "TOKEN_EXPIRED",
				message: err.message,
			},
		})
		return
	}

	// 4) Custom HttpError-like objects
	const status = typeof err.status === "number" ? err.status : 500
	const message = err.message || "Internal Server Error"

	res.status(status).json({
		success: false,
		error: {
			code: String(status),
			message,
		},
	})
}
