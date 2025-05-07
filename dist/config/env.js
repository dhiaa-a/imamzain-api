"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
// src/config/env.ts
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// 1. load .env.{NODE_ENV}.local → .env.development.local (etc)
(0, dotenv_1.config)({
    path: `.env.${process.env.NODE_ENV || "development"}.local`,
});
// 2. declare what you expect, with defaults/types
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((n) => !Number.isNaN(n), { message: "PORT must be a number" })
        .default("3000"),
    DATABASE_URL: zod_1.z.string().url(),
    //   JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
    //   MAIL_API_KEY: z.string().min(1),
    //   MAIL_FROM: z.string().email(),
});
// 3. parse & validate process.env
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
// 4. export a fully–typed config object
exports.env = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: parsed.data.PORT,
    DATABASE_URL: parsed.data.DATABASE_URL,
    //   JWT_SECRET: parsed.data.JWT_SECRET,
    //   MAIL_API_KEY: parsed.data.MAIL_API_KEY,
    //   MAIL_FROM: parsed.data.MAIL_FROM,
};
