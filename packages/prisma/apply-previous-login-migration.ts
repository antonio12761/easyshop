import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Carica le variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const prisma = new PrismaClient();

async function applyPreviousLoginMigration() {
  try {
    console.log("🔄 Applicando migrazione per previousLoginAt...");

    // Aggiungi la colonna se non esiste
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "previousLoginAt" TIMESTAMP(3);
    `;

    // Per gli utenti esistenti, se hanno lastLoginAt, copialo in previousLoginAt
    const result = await prisma.$executeRaw`
      UPDATE "User" 
      SET "previousLoginAt" = "lastLoginAt" 
      WHERE "lastLoginAt" IS NOT NULL AND "previousLoginAt" IS NULL;
    `;

    console.log("✅ Migrazione completata con successo!");
    console.log(`📊 Utenti aggiornati: ${result}`);

    // Verifica il risultato con query SQL diretta (senza usare il client Prisma)
    const users = await prisma.$queryRaw`
      SELECT email, "lastLoginAt", "previousLoginAt" 
      FROM "User" 
      LIMIT 10;
    `;

    console.log("👥 Stato utenti:");
    console.log(users);
  } catch (error) {
    console.error("❌ Errore durante la migrazione:", error);
  } finally {
    await prisma.$disconnect();
  }
}

applyPreviousLoginMigration();
