import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Carica le variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log("🔄 Applicando migrazione per hasSeenWelcome...");

    // Aggiungi la colonna se non esiste
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false;
    `;

    // Aggiorna gli utenti esistenti che hanno già fatto login
    const result = await prisma.$executeRaw`
      UPDATE "User" 
      SET "hasSeenWelcome" = true 
      WHERE "lastLoginAt" IS NOT NULL;
    `;

    console.log("✅ Migrazione completata con successo!");
    console.log(`📊 Utenti aggiornati: ${result}`);

    // Verifica il risultato
    const users = await prisma.user.findMany({
      select: {
        email: true,
        hasSeenWelcome: true,
        lastLoginAt: true,
      },
    });

    console.log("👥 Stato utenti:");
    users.forEach((user) => {
      console.log(
        `   - ${user.email}: hasSeenWelcome=${user.hasSeenWelcome}, lastLogin=${
          user.lastLoginAt ? "✅" : "❌"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Errore durante la migrazione:", error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
