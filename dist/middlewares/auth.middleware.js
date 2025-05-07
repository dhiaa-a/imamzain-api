"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../database/prisma");
// 1) Verify JWT and load user
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
            .status(401)
            .json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
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
        req.user = {
            id: user.id,
            username: user.username,
            roles: user.roles.map((ur) => ur.role.name),
        };
        next();
    }
    catch {
        res
            .status(403)
            .json({ success: false, error: { code: "FORBIDDEN", message: "Invalid or expired token" } });
        return;
    }
};
exports.authenticateJWT = authenticateJWT;
// 2) Guard by role(s)
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const authReq = req;
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
exports.authorize = authorize;
