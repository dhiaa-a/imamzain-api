// src/middlewares/jwt.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    roles: string[];
  };
}

interface TokenPayload extends JwtPayload {
  userId: number;
}

// helper: extract token from header
function getToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

// 1) Verify access token middleware
export async function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "No token provided" },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "User not found or inactive" },
      });
      return;
    }

    // attach user to request
    (req as AuthRequest).user = {
      id: user.id,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    const message =
      err instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token";
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message },
    });
    return;
  }
}

// 2) Role‑based authorization middleware
export function authorizeRoles(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }
    const hasRole = authReq.user.roles.some((r) => allowed.includes(r));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Insufficient permissions" },
      });
      return;
    }
    next();
  };
}
