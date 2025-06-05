import fs from "fs";
import path from "path";

function listExistingFiles() {
  console.log("🔍 Checking existing Prisma files...");

  const baseDir = path.join(__dirname, "prisma", "base");
  const modelsDir = path.join(__dirname, "prisma", "models");

  console.log("📁 Base directory:", baseDir);
  if (fs.existsSync(baseDir)) {
    const baseFiles = fs.readdirSync(baseDir);
    console.log("📄 Base files:", baseFiles);

    baseFiles.forEach((file) => {
      if (file.endsWith(".prisma")) {
        const filePath = path.join(baseDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        console.log(`\n📋 Content of ${file}:`);
        console.log("=" * 30);
        console.log(content);
        console.log("=" * 30);
      }
    });
  }

  console.log("\n📁 Models directory:", modelsDir);
  if (fs.existsSync(modelsDir)) {
    const modelFiles = fs.readdirSync(modelsDir);
    console.log("📄 Model files:", modelFiles);

    modelFiles.forEach((file) => {
      if (file.endsWith(".prisma")) {
        const filePath = path.join(modelsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        console.log(`\n📋 Content of ${file}:`);
        console.log("=" * 30);
        console.log(content);
        console.log("=" * 30);
      }
    });
  }
}

listExistingFiles();
