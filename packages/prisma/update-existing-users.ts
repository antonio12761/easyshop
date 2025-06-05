import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Carica le variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log("🔄 Aggiornando lastLoginAt per utenti esistenti...");

    // Aggiorna tutti gli utenti che hanno hasSeenWelcome = true
    // (significa che hanno già fatto login almeno una volta)
    const result = await prisma.user.updateMany({
      where: {
        hasSeenWelcome: true,
        lastLoginAt: null,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    console.log(`✅ Aggiornati ${result.count} utenti esistenti`);

    // Verifica il risultato
    const users = await prisma.user.findMany({
      select: {
        email: true,
        lastLoginAt: true,
        hasSeenWelcome: true,
      },
    });

    console.log("\n👥 Stato finale degli utenti:");
    users.forEach((user) => {
      console.log(
        `   - ${user.email}: lastLoginAt=${
          user.lastLoginAt ? "✅" : "❌"
        }, hasSeenWelcome=${user.hasSeenWelcome}`
      );
    });
  } catch (error) {
    console.error("❌ Errore durante l'aggiornamento:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();
