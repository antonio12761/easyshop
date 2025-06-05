import { prisma } from "./src/db"; // Assicurati che questo punti al client corretto
import { hash } from "bcryptjs";

async function main() {
  const password = await hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@revup.dev" },
    update: {},
    create: {
      email: "admin@revup.dev",
      emailVerified: new Date(),
      passwordHash: password,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@revup.dev" },
    update: {},
    create: {
      email: "user@revup.dev",
      emailVerified: new Date(),
      passwordHash: password,
      role: "user",
    },
  });

  console.log("✅ Seed completato con admin@revup.dev e user@revup.dev (password123)");
}

main()
  .catch((e) => {
    console.error("❌ Errore durante il seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
