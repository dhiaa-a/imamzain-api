"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUserActive = updateUserActive;
exports.updateUserRoles = updateUserRoles;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../database/prisma");
async function getAllUsers(_req, res, next) {
    try {
        const users = await prisma_1.prisma.user.findMany({
            include: { roles: { include: { role: true } }, profile: true },
        });
        res.json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
}
async function getUserById(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res
            .status(400)
            .json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid user ID" } });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } }, profile: true },
        });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function createUser(req, res, next) {
    const { email, username, password, roles: roleIds } = req.body;
    if (!email || !username || !password || !Array.isArray(roleIds)) {
        return res
            .status(400)
            .json({ success: false, error: { code: "BAD_REQUEST", message: "Missing fields or roles" } });
    }
    try {
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                roles: { create: roleIds.map((rId) => ({ roleId: rId })) },
            },
            include: { roles: { include: { role: true } } },
        });
        res.status(201).json({ success: true, data: user, message: "User created" });
    }
    catch (err) {
        if (err.code === "P2002") {
            return res
                .status(409)
                .json({ success: false, error: { code: "CONFLICT", message: "Email or username already in use" } });
        }
        next(err);
    }
}
async function updateUserActive(req, res, next) {
    const id = Number(req.params.id);
    const { isActive } = req.body;
    if (Number.isNaN(id) || typeof isActive !== "boolean") {
        return res
            .status(400)
            .json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid input" } });
    }
    try {
        const user = await prisma_1.prisma.user.update({ where: { id }, data: { isActive } });
        res.json({ success: true, data: user, message: "User status updated" });
    }
    catch (err) {
        next(err);
    }
}
async function updateUserRoles(req, res, next) {
    const id = Number(req.params.id);
    const { roles: roleIds } = req.body;
    if (Number.isNaN(id) || !Array.isArray(roleIds)) {
        return res
            .status(400)
            .json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid input" } });
    }
    try {
        await prisma_1.prisma.userRole.deleteMany({ where: { userId: id } });
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: { roles: { create: roleIds.map((rId) => ({ roleId: rId })) } },
            include: { roles: { include: { role: true } } },
        });
        res.json({ success: true, data: user, message: "Roles updated" });
    }
    catch (err) {
        next(err);
    }
}
