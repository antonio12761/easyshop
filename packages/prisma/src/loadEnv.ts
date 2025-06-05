import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Questo file viene eseguito solo lato server
// Debug del percorso corrente
if (process.env.NODE_ENV === "development") {
  console.log("📍 Loading environment variables...");
}

// Trova la root del monorepo
const monorepoRoot = resolve(__dirname, "../../../");
const webAppRoot = resolve(__dirname, "../../../apps/web");

// Prova a caricare da diverse posizioni, in ordine
const possibleEnvPaths = [
  resolve(monorepoRoot, ".env.local"),
  resolve(monorepoRoot, ".env"),
  resolve(webAppRoot, ".env.local"),
  resolve(webAppRoot, ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
];

let loaded = false;

// Prova ogni percorso e carica il primo che esiste
for (const envPath of possibleEnvPaths) {
  if (existsSync(envPath)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Found .env file at: ${envPath}`);
    }
    config({ path: envPath });
    loaded = true;
    break;
  }
}

if (!loaded && process.env.NODE_ENV === "development") {
  console.warn("⚠️ No .env file found in standard paths!");
}

// Fallback per sviluppo
if (!process.env.DATABASE_URL && process.env.NEON_DATABASE_URL) {
  if (process.env.NODE_ENV === "development") {
    console.log("🔄 Using NEON_DATABASE_URL as fallback");
  }
  process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required but not found!");
}

if (process.env.NODE_ENV === "development") {
  console.log("✅ DATABASE_URL loaded successfully");
}
