// src/prisma.ts
import { PrismaClient } from "@prisma/client"; 
import { env } from "../config/env";

declare global {
  // prevent multiple instances in dev
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.prismaClient ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,    // ← now this is defined!
      },
    },
    log: ["query", "info"],
  });

if (env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}
