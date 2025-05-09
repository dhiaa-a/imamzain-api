import { Router } from "express";  
import { login, logout, refreshToken } from "../controllers/auth.controller";

const authRoutes = Router();

// POST /api/v1/auth/login
authRoutes.post("/login", login); 
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);

export default authRoutes;
