#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { parseCSharpDTO } from "./parser/csharpParser";
import { generateTsClass, generateTsEnum } from "./generator/tsGenerator";

const [sourcePathRaw, destPathRaw, enumsSourcePathRaw] = process.argv.slice(2);

if (!sourcePathRaw || !destPathRaw) {
  console.error(
    "Usage: sharpscript <sourceClassesPath> <destPath> [enumsSourcePath]"
  );
  process.exit(1);
}

const sourcePath = path.resolve(sourcePathRaw);
const destPath = path.resolve(destPathRaw);
const enumsSourcePath = enumsSourcePathRaw
  ? path.resolve(enumsSourcePathRaw)
  : null;

const typesRoot = path.join(destPath, "@types");
const enumsRoot = path.join(destPath, "enums");

ensureDir(typesRoot);
if (enumsSourcePath) ensureDir(enumsRoot);

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Removes folder suffixes like DTO, DTOs, dto, dtos */
function cleanFolderName(folderName: string) {
  return folderName.replace(/dto(s)?$/i, "").toLowerCase();
}

/** Recursively collect all folders that contain .cs files */
function getFoldersWithCsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const csFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".cs"));
  const subfolders = entries.filter((e) => e.isDirectory());

  let result: string[] = [];
  if (csFiles.length > 0) result.push(dir);

  for (const sub of subfolders) {
    result = result.concat(getFoldersWithCsFiles(path.join(dir, sub.name)));
  }
  return result;
}

// PROCESS CLASSES PER FOLDER (FLAT OUTPUT)
const folders = getFoldersWithCsFiles(sourcePath);

for (const folder of folders) {
  const folderName = path.basename(folder);
  const tsFileName = cleanFolderName(folderName) + ".type.ts";
  const tsFilePath = path.join(typesRoot, tsFileName);

  let combinedCode = "";

  const csFiles = fs.readdirSync(folder).filter((f) => f.endsWith(".cs"));
  for (const file of csFiles) {
    const code = fs.readFileSync(path.join(folder, file), "utf-8");
    const { classes } = parseCSharpDTO(code);

    for (const cls of classes) combinedCode += generateTsClass(cls) + "\n\n";
  }

  fs.writeFileSync(tsFilePath, combinedCode, "utf-8");
  console.log(`✅ Generated combined file: ${tsFileName}`);
}

// PROCESS ENUMS FOLDER
if (enumsSourcePath && fs.existsSync(enumsSourcePath)) {
  const enumFiles = fs
    .readdirSync(enumsSourcePath)
    .filter((f) => f.endsWith(".cs"));
  let combinedEnumCode = "// Auto-generated enums\n\n";

  for (const file of enumFiles) {
    const code = fs.readFileSync(path.join(enumsSourcePath, file), "utf-8");
    const { enums } = parseCSharpDTO(code);

    for (const e of enums) {
      combinedEnumCode += generateTsEnum(e) + "\n\n";
    }
  }

  const enumFilePath = path.join(enumsRoot, "enum.ts");
  fs.writeFileSync(enumFilePath, combinedEnumCode, "utf-8");
  console.log(`✅ Generated combined enum file: enums/enum.ts`);
} else {
  console.log(
    "ℹ️  No enums folder provided or does not exist. Skipping enums generation."
  );
}
