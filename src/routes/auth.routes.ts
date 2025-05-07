import { Router } from "express";  
import { login } from "../controllers/auth.controller";

const authRoutes = Router();

// POST /api/v1/auth/login
authRoutes.post("/login", login);

export default authRoutes;
