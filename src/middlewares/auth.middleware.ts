// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../database/prisma";

// Extend Express’s Request with our user payload
export interface AuthRequest extends Request {
  user?: { id: number; username: string; roles: string[] };
}

// 1) Verify JWT and load user
export const authenticateJWT: RequestHandler = async (
  req,
  res,
  next
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      res
        .status(401)
        .json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
      return;
    }

    // attach user info to request
    (req as AuthRequest).user = {
      id: user.id,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };

    next();
  } catch {
    res
      .status(403)
      .json({ success: false, error: { code: "FORBIDDEN", message: "Invalid or expired token" } });
    return;
  }
};

// 2) Guard by role(s)
export const authorize = (...allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res
        .status(401)
        .json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      return;
    }

    if (!authReq.user.roles.some((r) => allowedRoles.includes(r))) {
      res
        .status(403)
        .json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
      return;
    }

    next();
  };
};
