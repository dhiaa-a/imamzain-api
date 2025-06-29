// src/types/article.types.ts

export interface CreateArticleRequest {
	slug?: string // Optional - will be auto-generated if not provided
	categoryId: number
	publishedAt?: string // ISO date string, optional
	isPublished?: boolean // Optional, defaults to false
	translations: CreateArticleTranslation[]
	attachments?: ArticleAttachmentRequest[] // Optional attachments during creation
}

export interface CreateArticleTranslation {
	languageCode: string
	isDefault: boolean
	title: string
	summary?: string
	body: string
	metaTitle?: string
	metaDescription?: string
}

export interface UpdateArticleRequest {
	slug?: string
	categoryId?: number
	publishedAt?: string // ISO date string
	isPublished?: boolean
	translations?: UpdateArticleTranslation[]
	attachments?: ArticleAttachmentRequest[] // Optional attachments during update
}

export interface UpdateArticleTranslation {
	id?: number // if updating existing translation
	languageCode: string
	isDefault?: boolean
	title: string
	summary?: string
	body: string
	metaTitle?: string
	metaDescription?: string
}

export interface ArticleResponse {
	id: number
	slug: string
	views: number
	publishedAt: string | null
	isPublished: boolean
	categoryId: number
	createdAt: string
	updatedAt: string
	category: {
		id: number
		slug: string
		name: string
	}
	translations: ArticleTranslationResponse[]
	attachments: ArticleAttachmentResponse[]
}

export interface ArticleAttachmentResponse {
	id: number
	articleId: number
	attachmentId: number
	type: string
	order: number
	caption?: string
	attachment: {
		id: number
		originalName: string
		fileName: string
		path: string
		mimeType: string
		size: number
		disk: string
		collection?: string
		altText?: string
		metadata?: Record<string, any>
		createdAt: string
		updatedAt: string
		url: string
	}
}

export interface ArticleTranslationResponse {
	id: number
	articleId: number
	languageCode: string
	isDefault: boolean
	title: string
	summary?: string
	body: string
	metaTitle?: string
	metaDescription?: string
	language: {
		code: string
		name: string
		nativeName: string
	}
}

export interface GetArticlesQuery {
	page?: number
	limit?: number
	categoryId?: number
	languageCode?: string
	search?: string
}

export interface ArticleAttachmentRequest {
	attachmentId: number
	type: "featured" | "gallery" | "attachment" | "other"
	order: number
	caption?: string
}