import fs from "fs";
import path from "path";

function checkSchemaStructure() {
  console.log("🔍 Checking Prisma schema structure...");

  const schemaPath = path.join(__dirname, "schema.prisma");
  const modelsDir = path.join(__dirname, "prisma", "models");
  const baseDir = path.join(__dirname, "prisma", "base");

  console.log("📁 Schema file:", schemaPath);
  console.log("📁 Models directory:", modelsDir);
  console.log("📁 Base directory:", baseDir);

  // Controlla se esistono le directory
  if (fs.existsSync(modelsDir)) {
    console.log("✅ Models directory exists");
    const modelFiles = fs.readdirSync(modelsDir);
    console.log("📄 Model files:", modelFiles);
  } else {
    console.log("❌ Models directory not found");
  }

  if (fs.existsSync(baseDir)) {
    console.log("✅ Base directory exists");
    const baseFiles = fs.readdirSync(baseDir);
    console.log("📄 Base files:", baseFiles);
  } else {
    console.log("❌ Base directory not found");
  }

  // Controlla il contenuto dello schema attuale
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    console.log("\n📋 Current schema content (first 500 chars):");
    console.log(schemaContent.substring(0, 500) + "...");

    // Cerca l'enum Role
    if (schemaContent.includes("enum Role")) {
      console.log("✅ Enum Role found in schema");
    } else {
      console.log("❌ Enum Role NOT found in schema");
    }
  }
}

checkSchemaStructure();
