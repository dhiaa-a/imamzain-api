// src/prisma.ts
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
 

declare global {
  // Prevent multiple instances in development mode
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.prismaClient ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL, // Replace with actual DynamoDB URL
      },
    },
    // log: ['query', 'info'],
    log: [  'info'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}