import express, { Request, Response } from "express";
import { env } from "./config/env";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// 1) JSON middleware
app.use(express.json());

// 2) Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Imam Zain API is up and running!");
});

// 3) Swagger UI in non-prod
if (env.NODE_ENV !== "production") {
  const swaggerDocument = YAML.load("./src/docs/swagger.yaml");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  console.log(`🔎 Swagger UI enabled at http://localhost:${env.PORT}/docs`);
}

// 4) Mount API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
// …mount other routers here…

// 5) 404 handler
// app.use((req, res) =>
//   res.status(404).json({
//     success: false,
//     error: {
//       code: "NOT_FOUND",
//       message: `No route for ${req.method} ${req.originalUrl}`,
//     },
//   })
// );

// 6) Global error handler
app.use(errorHandler);

// 7) Start server
app.listen(env.PORT, () => {
  console.log(`📡 [${env.NODE_ENV}] Listening on http://localhost:${env.PORT}`);
});
