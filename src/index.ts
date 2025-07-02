// src/index.ts
import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"

import { env } from "./config/env"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
// import articleRouter from "./routes/article.routes"
// import attachmentRouter from "./routes/attachment.routes"
// import bookRouter from "./routes/book.routes"
// import researchRouter from "./routes/research.routes" 

// import bookCategoryRouter from "./routes/bookCategory.routes"
import { authenticateJWT } from "./middlewares/auth.middleware"
import { errorHandler } from "./middlewares/error.middleware"
import categoryRoutes from './routes/category.routes';
import tagRoutes from './routes/tag.routes';
import attachmentRouter from "./routes/attachment.routes"
const app = express()

// 1) JSON body parser
app.use(express.json())

// 2) Cookie parser
app.use(cookieParser())

// 3) CORS — allow your front end to call the API
app.use(
	cors({
		origin: "http://localhost:3000", // adjust as needed
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true, // if you need to send cookies or authorization headers
	}),
)

// 4) Referrer-Policy header
app.use((_req: Request, res: Response, next: NextFunction) => {
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
	next()
})

// 5) Health check
app.get("/", (_req: Request, res: Response) => {
	res.send("🚀 Imam Zain API is up and running!")
})

// 6) Swagger UI (only in non-production)
if (env.NODE_ENV !== "production") {
	const swaggerDocument = YAML.load("./src/docs/swagger.yaml")
	app.use(
		"/docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerDocument, { explorer: true }),
	)
	console.log(`🔎 Swagger UI enabled at http://localhost:${env.PORT}/docs`)
}

// 7) Public auth routes (NO JWT required)
app.use("/api/v1/auth", authRoutes)

// 8) Protected user routes (JWT required)
app.use("/api/v1/users", authenticateJWT, userRoutes)




app.use('/api/v1/:lang/categories', categoryRoutes);
app.use('/api/v1/:lang/tags', tagRoutes);


app.use('/api/v1/attachments', attachmentRouter);



// 9) Attachment routes (mixed public/protected)
// app.use("/api/v1/attachments", attachmentRouter)



// 11) Language-specific article routes (JWT required for create/update/delete)
// app.use("/api/v1", articleRouter)

// 12) Book routes (mixed public/protected)
// app.use("/api/v1", bookRouter)

// 13) Research routes (mixed public/protected)
// app.use("/api/v1", researchRouter)

// 14) Global error handler
app.use(errorHandler)

// 15) Start server
app.listen(env.PORT, () => {
	console.log(
		`📡 [${env.NODE_ENV}] Listening on http://localhost:${env.PORT}`,
	)
})