import fs from "fs";
import path from "path";

function checkAndUpdateSchema() {
  const schemaPath = path.join(__dirname, "schema.prisma");

  console.log("🔍 Verificando schema Prisma...");

  if (!fs.existsSync(schemaPath)) {
    console.log("❌ Schema Prisma non trovato!");
    return;
  }

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // Verifica se previousLoginAt è già presente
  if (schemaContent.includes("previousLoginAt")) {
    console.log("✅ Campo previousLoginAt già presente nello schema");
  } else {
    console.log("❌ Campo previousLoginAt mancante nello schema");

    // Aggiungi il campo allo schema
    const updatedSchema = schemaContent.replace(
      /lastLoginAt\s+DateTime\?\s*\n/,
      `lastLoginAt              DateTime?
  previousLoginAt          DateTime?  // Login precedente
`
    );

    fs.writeFileSync(schemaPath, updatedSchema);
    console.log("✅ Campo previousLoginAt aggiunto allo schema");
  }

  console.log("📋 Schema User model:");
  const userModelMatch = schemaContent.match(/model User \{[\s\S]*?\n\}/m);
  if (userModelMatch) {
    console.log(userModelMatch[0]);
  }
}

checkAndUpdateSchema();
