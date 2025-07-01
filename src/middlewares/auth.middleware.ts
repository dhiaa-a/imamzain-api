// src/middlewares/auth.middleware.ts
import { Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { env } from "../config/env";
import { AuthRequest, TokenPayload } from "../types/middleware.types";
import { ErrorResponse } from "../types/error.types";

function extractToken(req: AuthRequest): string | null {
	const authorization = req.headers.authorization;
	if (authorization?.startsWith("Bearer ")) {
		return authorization.slice(7);
	}
	return null;
}

/**
 * Authenticate user by verifying JWT, loading roles & permissions,
 * and attaching them to req.user
 */
export async function authenticateJWT(
	req: AuthRequest,
	res: Response<ErrorResponse>,
	next: NextFunction,
): Promise<void> {
	try {
		const token = extractToken(req);
		
		if (!token) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "UNAUTHORIZED",
					message: "No token provided",
				},
			};
			res.status(401).json(errorResponse);
			return;
		}

		let payload: TokenPayload;
		try {
			payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
		} catch (err) {
			const message = err instanceof TokenExpiredError 
				? "Token expired" 
				: "Invalid token";
			
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "FORBIDDEN",
					message,
				},
			};
			res.status(403).json(errorResponse);
			return;
		}

		// Fetch user with roles & permissions
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
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "FORBIDDEN",
					message: "User not found or inactive",
				},
			};
			res.status(403).json(errorResponse);
			return;
		}

		// Collect role names
		const roles = user.roles.map((userRole) => userRole.role.name);

		// Collect all permissions from roles and groups
		const rolePermissions = user.roles.flatMap((userRole) =>
			userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.name)
		);
		
		const groupPermissions = user.groups.flatMap((groupMember) =>
			groupMember.group.groupPermissions.map((groupPermission) => groupPermission.permission.name)
		);
		
		const permissions = Array.from(new Set([...rolePermissions, ...groupPermissions]));

		// Attach user info to request
		req.user = {
			id: user.id,
			username: user.username,
			roles,
			permissions,
		};

		next();
	} catch (error) {
		const errorResponse: ErrorResponse = {
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "Authentication error",
			},
		};
		res.status(500).json(errorResponse);
	}
}

/**
 * Authorize: ensure the authenticated user has the given permission
 */
export function authorize(permission: string) {
	return (req: AuthRequest, res: Response<ErrorResponse>, next: NextFunction): void => {
		if (!req.user) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "UNAUTHORIZED",
					message: "Not authenticated",
				},
			};
			res.status(401).json(errorResponse);
			return;
		}

		if (!req.user.permissions.includes(permission)) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "FORBIDDEN",
					message: "Insufficient permissions",
				},
			};
			res.status(403).json(errorResponse);
			return;
		}

		next();
	};
}

/**
 * Authorize by role: ensure the authenticated user has at least one of the given roles
 */
export function authorizeRole(roles: string | string[]) {
	const roleArray = Array.isArray(roles) ? roles : [roles];
	
	return (req: AuthRequest, res: Response<ErrorResponse>, next: NextFunction): void => {
		if (!req.user) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "UNAUTHORIZED",
					message: "Not authenticated",
				},
			};
			res.status(401).json(errorResponse);
			return;
		}

		const hasRole = roleArray.some(role => req.user!.roles.includes(role));
		
		if (!hasRole) {
			const errorResponse: ErrorResponse = {
				success: false,
				error: {
					code: "FORBIDDEN",
					message: "Insufficient role permissions",
				},
			};
			res.status(403).json(errorResponse);
			return;
		}

		next();
	};
}