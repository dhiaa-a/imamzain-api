// src/routes/auth.routes.ts
import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { loginSchema } from "../validations/auth.validations";

const authRoutes = Router();

// POST /api/v1/auth/login
authRoutes.post("/login", validate(loginSchema), login);

// POST /api/v1/auth/refresh
authRoutes.post("/refresh", refreshToken);

// POST /api/v1/auth/logout
authRoutes.post("/logout", logout);

export default authRoutes;