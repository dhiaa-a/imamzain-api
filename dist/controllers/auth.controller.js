"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../database/prisma");
async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({
            success: false,
            error: {
                code: "BAD_REQUEST",
                message: "Username and password required",
            },
        });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { username },
            include: { roles: { include: { role: true } } },
        });
        if (!user || !user.isActive) {
            return res
                .status(401)
                .json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
            });
        }
        const match = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!match) {
            return res
                .status(401)
                .json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles.map((ur) => ur.role.name),
                },
            },
        });
    }
    catch (err) {
        console.log(err);
    }
}
