"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSharpDTO = parseCSharpDTO;
function parseCSharpDTO(code) {
    const namespaceMatch = code.match(/namespace\s+([\w\.]+)/);
    const namespace = namespaceMatch ? namespaceMatch[1] : undefined;
    const classes = [];
    const enums = [];
    // PARSE ENUMS
    const enumRegex = /enum\s+(\w+)\s*{([\s\S]*?)}/g;
    let enumMatch;
    while ((enumMatch = enumRegex.exec(code)) !== null) {
        const [, name, body] = enumMatch;
        if (!body || !name)
            continue;
        const members = body
            .split(",")
            .map((m) => m.replace(/\/\/.*$/g, "").trim())
            .filter(Boolean);
        enums.push({ name, members });
    }
    // PARSE CLASSES
    const classRegex = /class\s+(\w+)\s*{/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
        const className = match[1];
        const startIndex = match.index + match[0].length - 1;
        let braceCount = 1;
        let endIndex = startIndex;
        while (braceCount > 0 && endIndex < code.length) {
            endIndex++;
            const char = code[endIndex];
            if (char === "{")
                braceCount++;
            else if (char === "}")
                braceCount--;
        }
        const body = code.slice(startIndex + 1, endIndex).trim();
        const properties = [];
        const propRegex = /public\s+([\w<>\?]+)\s+(\w+)\s*{\s*get;\s*set;\s*}/g;
        let propMatch;
        while ((propMatch = propRegex.exec(body)) !== null) {
            const [, typeRaw, nameRaw] = propMatch;
            const type = typeRaw ?? "any";
            const name = nameRaw ?? "Unknown";
            properties.push({
                name,
                type,
                isNullable: type.endsWith("?"),
            });
        }
        const nestedParse = parseCSharpDTO(body);
        const nestedClasses = nestedParse.classes;
        classes.push({
            name: className,
            namespace,
            properties,
            nestedClasses: nestedClasses.length ? nestedClasses : undefined,
        });
    }
    return { classes, enums };
}
//# sourceMappingURL=csharpParser.js.map