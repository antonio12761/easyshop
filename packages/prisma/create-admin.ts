import "./src/loadEnv";
import { prisma } from "./src/db";
import { hash } from "bcryptjs";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("❌ Uso: pnpm create-admin <email> <password>");
    console.error(
      "   Esempio: pnpm create-admin admin@revup.com mypassword123"
    );
    process.exit(1);
  }

  try {
    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Promuovi utente esistente ad admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`✅ Utente ${email} promosso ad ADMIN`);
      return updatedUser;
    } else {
      // Crea nuovo utente admin
      const passwordHash = await hash(password, 10);

      const newAdmin = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "ADMIN",
          emailVerified: new Date(), // Verifica automaticamente l'email per l'admin
          name: "Administrator",
        },
      });

      console.log(`✅ Nuovo utente admin creato: ${email}`);
      return newAdmin;
    }
  } catch (error) {
    console.error("❌ Errore nella creazione dell'admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
