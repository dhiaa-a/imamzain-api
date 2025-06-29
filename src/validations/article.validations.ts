// src/validations/article.validations.ts
import { z } from "zod"
import { Request, Response, NextFunction } from "express"

const createArticleTranslationSchema = z.object({
	languageCode: z.string().min(2).max(5),
	isDefault: z.boolean(),
	title: z.string().min(1).max(500),
	summary: z.string().optional(),
	body: z.string().min(1),
	metaTitle: z.string().max(60).optional(),
	metaDescription: z.string().max(160).optional(),
})

const articleAttachmentSchema = z.object({
	attachmentId: z.number().int().positive(),
	type: z.enum(["featured", "gallery", "attachment", "other"]),
	order: z.number().int().min(0),
	caption: z.string().optional(),
})

const createArticleSchema = z.object({
	slug: z.string().min(1).max(255).optional(),
	categoryId: z.number().int().positive(),
	publishedAt: z.string().datetime().optional(),
	isPublished: z.boolean().optional(),
	translations: z.array(createArticleTranslationSchema).min(1),
	attachments: z.array(articleAttachmentSchema).optional(),
})

const updateArticleTranslationSchema = z.object({
	id: z.number().int().positive().optional(),
	languageCode: z.string().min(2).max(5),
	isDefault: z.boolean().optional(),
	title: z.string().min(1).max(500),
	summary: z.string().optional(),
	body: z.string().min(1),
	metaTitle: z.string().max(60).optional(),
	metaDescription: z.string().max(160).optional(),
})

const updateArticleSchema = z.object({
	slug: z.string().min(1).max(255).optional(),
	categoryId: z.number().int().positive().optional(),
	publishedAt: z.string().datetime().optional(),
	isPublished: z.boolean().optional(),
	translations: z.array(updateArticleTranslationSchema).optional(),
	attachments: z.array(articleAttachmentSchema).optional(),
})

export function validateCreateArticle(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	try {
		createArticleSchema.parse(req.body)
		next()
	} catch (error: any) {
		res.status(400).json({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Invalid request data",
				details: error.errors,
			},
		})
	}
}

export function validateUpdateArticle(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	try {
		updateArticleSchema.parse(req.body)
		next()
	} catch (error: any) {
		res.status(400).json({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Invalid request data",
				details: error.errors,
			},
		})
	}
}