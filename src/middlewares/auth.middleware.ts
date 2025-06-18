import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

interface TokenPayload extends JwtPayload {
  userId: number;
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

/**
 * 1) Authenticate user by verifying JWT, loading roles & permissions,
 *    and attaching them to req.user
 */
export async function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "No token provided" },
    });
    return;
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token";
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message },
    });
    return;
  }

  // fetch user with roles & permissions
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
      groups: {
        include: {
          group: {
            include: {
              groupPermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "User not found or inactive" },
    });
    return;
  }

  // collect role names
  const roles = user.roles.map((ur) => ur.role.name);

  // collect all permissions from roles and groups
  const rolePerms = user.roles.flatMap((ur) =>
    ur.role.rolePermissions.map((rp) => rp.permission.name)
  );
  const groupPerms = user.groups.flatMap((gm) =>
    gm.group.groupPermissions.map((gp) => gp.permission.name)
  );
  const permissions = Array.from(new Set([...rolePerms, ...groupPerms]));

  // attach to request
  req.user = {
    id: user.id,
    username: user.username,
    roles,
    permissions,
  };

  next();
}

/**
 * 2) Authorize: ensure the authenticated user has the given permission
 */
export function authorize(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }
    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Insufficient permissions" },
      });
      return;
    }
    next();
  };
}