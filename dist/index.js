"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// 1) JSON middleware
app.use(express_1.default.json());
// 2) Health check
app.get("/", (_req, res) => {
    res.send("🚀 Imam Zain API is up and running!");
});
// 3) Swagger UI in non-prod
if (env_1.env.NODE_ENV !== "production") {
    const swaggerDocument = yamljs_1.default.load("./src/docs/swagger.yaml");
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, { explorer: true }));
    console.log(`🔎 Swagger UI enabled at http://localhost:${env_1.env.PORT}/docs`);
}
// 4) Mount API routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", user_routes_1.default);
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
app.use(error_middleware_1.errorHandler);
// 7) Start server
app.listen(env_1.env.PORT, () => {
    console.log(`📡 [${env_1.env.NODE_ENV}] Listening on http://localhost:${env_1.env.PORT}`);
});
