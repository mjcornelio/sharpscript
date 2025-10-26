export function mapCSharpTypeToTs(csharpType: string): string {
  const baseType = csharpType.replace("?", "");

  const map: Record<string, string> = {
    string: "string",
    int: "number",
    double: "number",
    float: "number",
    decimal: "number",
    bool: "boolean",
    DateTime: "Date",
    Guid: "string",
    object: "any",
  };

  const listMatch = baseType.match(/List<(\w+)>/);
  if (listMatch && listMatch[1]) {
    return `${mapCSharpTypeToTs(listMatch[1])}[]`;
  }

  return map[baseType] || baseType;
}
