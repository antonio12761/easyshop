// Esporta il client Prisma
export { PrismaClient } from "@prisma/client";

// Crea e esporta l'istanza del database
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

// Esporta anche come 'prisma' per compatibilità con @repo/prisma
export const prisma = db;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export default per compatibilità
export { db as default };
