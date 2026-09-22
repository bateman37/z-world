import { createPrismaClient, type PrismaClient } from "@z-world/persistence";

/**
 * Cliente Prisma único del servidor (server actions / route handlers).
 * Nunca se importa desde el Worker ni desde componentes cliente (§6.1).
 * Se cachea en `globalThis` para no multiplicar conexiones en desarrollo
 * con recarga en caliente.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
