"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// src/prisma.ts
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
exports.prisma = global.prismaClient ??
    new client_1.PrismaClient({
        datasources: {
            db: {
                url: env_1.env.DATABASE_URL, // ← now this is defined!
            },
        },
        log: ["query", "info"],
    });
if (env_1.env.NODE_ENV !== "production") {
    global.prismaClient = exports.prisma;
}
