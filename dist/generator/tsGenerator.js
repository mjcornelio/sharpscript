"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTsFromDtos = generateTsFromDtos;
exports.generateTsEnum = generateTsEnum;
exports.generateTsClass = generateTsClass;
const typeMapper_1 = require("../utils/typeMapper");
function generateTsFromDtos(classes, enums) {
    const output = [];
    for (const e of enums)
        output.push(generateTsEnum(e));
    for (const c of classes)
        output.push(generateTsClass(c));
    return output.join("\n\n");
}
function generateTsEnum(e) {
    return `export enum ${e.name} {\n${e.members
        .map((m) => {
        const cleanMember = m.split(/[\s\/]/)[0].trim();
        if (!cleanMember)
            return null;
        return `  ${cleanMember},`;
    })
        .filter(Boolean)
        .join("\n")}\n}`;
}
function generateTsClass(dto) {
    const props = dto.properties.map((p) => {
        const tsType = (0, typeMapper_1.mapCSharpTypeToTs)(p.type);
        const defaultValue = getDefaultValue(tsType, p.isNullable);
        return `  ${p.name}${p.isNullable ? "?" : ""}: ${tsType}${defaultValue !== undefined ? ` = ${defaultValue}` : ""};`;
    });
    let code = `export class ${dto.name} {\n${props.join("\n")}\n\n  constructor(init?: Partial<${dto.name}>) {\n    Object.assign(this, init);\n  }\n}`;
    if (dto.nestedClasses) {
        for (const nested of dto.nestedClasses) {
            code += "\n\n" + generateTsClass(nested);
        }
    }
    return code;
}
function getDefaultValue(tsType, isNullable) {
    if (tsType.endsWith("[]"))
        return "[]";
    if (isNullable)
        return "undefined";
    switch (tsType) {
        case "string":
            return `''`;
        case "number":
            return "0";
        case "boolean":
            return "false";
        case "Date":
            return "new Date()";
        default:
            if (tsType.endsWith("[]"))
                return "[]";
            return isNullable ? "undefined" : `new ${tsType}()`;
    }
}
//# sourceMappingURL=tsGenerator.js.map