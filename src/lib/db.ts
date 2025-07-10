import 'server-only';
import { PrismaClient } from '../generated/prisma';

// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
} 