// src/config/env.ts
import { config as loadEnv } from "dotenv"
import { z } from "zod"

// 1. Load environment files in order of precedence
// Try .env.local first (development), then .env
loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

// 2. declare what you expect, with defaults/types
const EnvSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z
		.string()
		.transform((val) => parseInt(val, 10))
		.refine((n) => !Number.isNaN(n), { message: "PORT must be a number" })
		.default("3000"),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 20 chars"),
	ACCESS_TOKEN_EXPIRES_IN: z.any().default("15m"),
	REFRESH_TOKEN_EXPIRES_IN: z.any().default("1d"),
	REFRESH_TOKEN_SECRET: z.any(),
	//   MAIL_API_KEY: z.string().min(1),
	//   MAIL_FROM: z.string().email(),
})

// 3. parse & validate process.env
const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
	console.error("❌ Invalid environment variables:", parsed.error.format())
	process.exit(1)
}

// 4. export a fully–typed config object
export const env = {
	NODE_ENV: parsed.data.NODE_ENV,
	PORT: parsed.data.PORT,
	DATABASE_URL: parsed.data.DATABASE_URL,
	JWT_SECRET: parsed.data.JWT_SECRET,
	ACCESS_TOKEN_EXPIRES_IN: parsed.data.ACCESS_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_EXPIRES_IN: parsed.data.REFRESH_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_SECRET: parsed.data.REFRESH_TOKEN_SECRET,
	//   MAIL_API_KEY: parsed.data.MAIL_API_KEY,
	//   MAIL_FROM: parsed.data.MAIL_FROM,
} as const
