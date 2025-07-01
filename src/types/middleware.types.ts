// src/types/middleware.types.ts
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthUser {
	id: number;
	username: string;
	roles: string[];
	permissions: string[];
}

export interface AuthRequest extends Request {
	user?: AuthUser;
}

export interface TokenPayload extends JwtPayload {
	userId: number;
}