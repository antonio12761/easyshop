import fs from "fs";
import path from "path";

function showGenerateSchema() {
  const generateSchemaPath = path.join(__dirname, "generate-schema.ts");

  console.log("🔍 Looking for generate-schema.ts...");
  console.log("📁 Path:", generateSchemaPath);

  if (fs.existsSync(generateSchemaPath)) {
    const content = fs.readFileSync(generateSchemaPath, "utf-8");
    console.log("✅ Found generate-schema.ts");
    console.log("📋 Content:");
    console.log("=" * 50);
    console.log(content);
    console.log("=" * 50);
  } else {
    console.log("❌ generate-schema.ts not found");

    // Cerca in altre posizioni
    const altPaths = [
      path.join(__dirname, "src", "generate-schema.ts"),
      path.join(__dirname, "..", "..", "generate-schema.ts"),
    ];

    for (const altPath of altPaths) {
      console.log(`🔍 Checking: ${altPath}`);
      if (fs.existsSync(altPath)) {
        console.log("✅ Found at:", altPath);
        const content = fs.readFileSync(altPath, "utf-8");
        console.log("📋 Content:");
        console.log(content);
        break;
      }
    }
  }
}

showGenerateSchema();
