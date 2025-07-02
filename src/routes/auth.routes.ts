// src/routes/auth.routes.ts
import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/auth.controller";

const authRoutes = Router();

// POST /api/v1/auth/login
authRoutes.post("/login",  login);

// POST /api/v1/auth/refresh
authRoutes.post("/refresh", refreshToken);

// POST /api/v1/auth/logout
authRoutes.post("/logout", logout);

export default authRoutes;