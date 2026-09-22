import { PrismaClient } from "../generated/index.js";

/**
 * Punto único de creación del cliente Prisma. Solo debe importarse desde
 * servidor (Next.js server actions/route handlers) o desde los tests de
 * integración de este paquete; nunca desde el Worker ni desde componentes
 * cliente (§6.1, §8.1 de WEB-001).
 */
export function createPrismaClient(databaseUrl?: string): PrismaClient {
  return new PrismaClient(
    databaseUrl
      ? { datasources: { db: { url: databaseUrl } } }
      : undefined,
  );
}

export type { PrismaClient };
