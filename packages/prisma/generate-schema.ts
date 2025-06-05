// packages/prisma/generate-schema.ts

import "./src/loadEnv";
import fs from "fs";
import path from "path";

const baseDir = path.resolve(__dirname, "base");
const modelsDir = path.resolve(__dirname, "models");
const outputPath = path.resolve(__dirname, "schema.prisma");

function readPrismaFiles(dir: string): string {
  if (!fs.existsSync(dir)) return "";
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".prisma"))
    .map((file) => fs.readFileSync(path.join(dir, file), "utf8"))
    .join("\n\n");
}

const baseContent = readPrismaFiles(baseDir);
const modelsContent = readPrismaFiles(modelsDir);

if (!baseContent) {
  console.error("❌ Nessun file .prisma trovato in base/.");
  process.exit(1);
}

if (!modelsContent) {
  console.warn(
    "⚠️ Nessun file .prisma trovato in models/. Procedo solo con base/."
  );
}

const fullSchema = `${baseContent.trim()}\n\n${modelsContent.trim()}`;
fs.writeFileSync(outputPath, fullSchema);

console.log("✅ schema.prisma aggiornato con successo!");
