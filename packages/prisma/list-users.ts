import "./src/loadEnv";
import { prisma } from "./src/db";

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("\n📋 Lista Utenti:");
    console.log("================");

    if (users.length === 0) {
      console.log("Nessun utente trovato.");
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Nome: ${user.name || "Non specificato"}`);
      console.log(`   Ruolo: ${user.role}`);
      console.log(
        `   Email verificata: ${user.emailVerified ? "✅ Sì" : "❌ No"}`
      );
      console.log(
        `   2FA: ${user.twoFactorEnabled ? "✅ Attivo" : "❌ Disattivo"}`
      );
      console.log(`   Creato: ${user.createdAt.toLocaleDateString("it-IT")}`);
    });

    console.log(`\n📊 Totale utenti: ${users.length}`);
    console.log(`👑 Admin: ${users.filter((u) => u.role === "ADMIN").length}`);
    console.log(`👤 Utenti: ${users.filter((u) => u.role === "USER").length}`);
  } catch (error) {
    console.error("❌ Errore nel recupero utenti:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
