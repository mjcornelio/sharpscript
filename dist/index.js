#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csharpParser_1 = require("./parser/csharpParser");
const tsGenerator_1 = require("./generator/tsGenerator");
const [sourcePathRaw, destPathRaw, enumsSourcePathRaw] = process.argv.slice(2);
if (!sourcePathRaw || !destPathRaw) {
    console.error("Usage: sharpscript <sourceClassesPath> <destPath> [enumsSourcePath]");
    process.exit(1);
}
const sourcePath = path_1.default.resolve(sourcePathRaw);
const destPath = path_1.default.resolve(destPathRaw);
const enumsSourcePath = enumsSourcePathRaw
    ? path_1.default.resolve(enumsSourcePathRaw)
    : null;
const typesRoot = path_1.default.join(destPath, "@types");
const enumsRoot = path_1.default.join(destPath, "enums");
ensureDir(typesRoot);
if (enumsSourcePath)
    ensureDir(enumsRoot);
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
/** Removes folder suffixes like DTO, DTOs, dto, dtos */
function cleanFolderName(folderName) {
    return folderName.replace(/dto(s)?$/i, "").toLowerCase();
}
/** Recursively collect all folders that contain .cs files */
function getFoldersWithCsFiles(dir) {
    const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    const csFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".cs"));
    const subfolders = entries.filter((e) => e.isDirectory());
    let result = [];
    if (csFiles.length > 0)
        result.push(dir);
    for (const sub of subfolders) {
        result = result.concat(getFoldersWithCsFiles(path_1.default.join(dir, sub.name)));
    }
    return result;
}
// PROCESS CLASSES PER FOLDER (FLAT OUTPUT)
const folders = getFoldersWithCsFiles(sourcePath);
for (const folder of folders) {
    const folderName = path_1.default.basename(folder);
    const tsFileName = cleanFolderName(folderName) + ".type.ts";
    const tsFilePath = path_1.default.join(typesRoot, tsFileName);
    let combinedCode = "";
    const csFiles = fs_1.default.readdirSync(folder).filter((f) => f.endsWith(".cs"));
    for (const file of csFiles) {
        const code = fs_1.default.readFileSync(path_1.default.join(folder, file), "utf-8");
        const { classes } = (0, csharpParser_1.parseCSharpDTO)(code);
        for (const cls of classes)
            combinedCode += (0, tsGenerator_1.generateTsClass)(cls) + "\n\n";
    }
    fs_1.default.writeFileSync(tsFilePath, combinedCode, "utf-8");
    console.log(`✅ Generated combined file: ${tsFileName}`);
}
// PROCESS ENUMS FOLDER
if (enumsSourcePath && fs_1.default.existsSync(enumsSourcePath)) {
    const enumFiles = fs_1.default
        .readdirSync(enumsSourcePath)
        .filter((f) => f.endsWith(".cs"));
    let combinedEnumCode = "// Auto-generated enums\n\n";
    for (const file of enumFiles) {
        const code = fs_1.default.readFileSync(path_1.default.join(enumsSourcePath, file), "utf-8");
        const { enums } = (0, csharpParser_1.parseCSharpDTO)(code);
        for (const e of enums) {
            combinedEnumCode += (0, tsGenerator_1.generateTsEnum)(e) + "\n\n";
        }
    }
    const enumFilePath = path_1.default.join(enumsRoot, "enum.ts");
    fs_1.default.writeFileSync(enumFilePath, combinedEnumCode, "utf-8");
    console.log(`✅ Generated combined enum file: enums/enum.ts`);
}
else {
    console.log("ℹ️  No enums folder provided or does not exist. Skipping enums generation.");
}
//# sourceMappingURL=index.js.map