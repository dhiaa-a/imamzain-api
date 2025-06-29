// src/middlewares/language.middleware.ts
import { Request, Response, NextFunction } from "express"
import { prisma } from "../database/prisma"

export async function validateLanguage(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { lang } = req.params

		if (!lang) {
			res.status(400).json({
				success: false,
				error: {
					code: "BAD_REQUEST",
					message: "Language parameter is required",
				},
			})
			return
		}

		// Check if language exists and is active
		const language = await prisma.language.findFirst({
			where: {
				code: lang,
				isActive: true,
			},
		})

		if (!language) {
			res.status(400).json({
				success: false,
				error: {
					code: "INVALID_LANGUAGE",
					message: "Invalid or inactive language code",
				},
			})
			return
		}

		next()
	} catch (error) {
		next(error)
	}
}