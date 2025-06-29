// src/routes/article.routes.ts
import { Router } from "express"
import {
	createArticleHandler,
	getArticleHandler,
	getArticleBySlugHandler,
	getArticlesHandler,
	updateArticleHandler,
	deleteArticleHandler,
} from "../controllers/article.controller"
import { authorize, authenticateJWT } from "../middlewares/auth.middleware"
import {
	validateCreateArticle,
	validateUpdateArticle,
} from "../validations/article.validations"
import { validateLanguage } from "../middlewares/language.middleware"

const articleRouter = Router()

// GET /api/v1/:lang/articles - Get all articles with filtering (public)
articleRouter.get("/:lang/articles", validateLanguage, getArticlesHandler)

// GET /api/v1/:lang/articles/:id - Get article by ID (public)
articleRouter.get("/:lang/articles/:id", validateLanguage, getArticleHandler)

// GET /api/v1/:lang/articles/slug/:slug - Get article by slug (public)
articleRouter.get(
	"/:lang/articles/slug/:slug",
	validateLanguage,
	getArticleBySlugHandler,
)

// POST /api/v1/:lang/articles - Create new article (requires permission)
articleRouter.post(
	"/:lang/articles",
	validateLanguage,
	authenticateJWT,
	authorize("CREATE_ARTICLE"),
	validateCreateArticle,
	createArticleHandler,
)

// PUT /api/v1/:lang/articles/:id - Update article (requires permission)
articleRouter.put(
	"/:lang/articles/:id",
	validateLanguage,
	authenticateJWT,
	authorize("UPDATE_ARTICLE"),
	validateUpdateArticle,
	updateArticleHandler,
)

// DELETE /api/v1/:lang/articles/:id - Delete article (requires permission)
articleRouter.delete(
	"/:lang/articles/:id",
	validateLanguage,
	authenticateJWT,
	authorize("DELETE_ARTICLE"),
	deleteArticleHandler,
)

export default articleRouter
