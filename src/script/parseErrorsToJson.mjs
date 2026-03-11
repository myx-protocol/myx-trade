import fs from "fs";

const text = fs.readFileSync("./errors", "utf8");

const regex =
  /│\s*\d+\s*│\s*'([0-9a-f]{8})'\s*│\s*'([^']+)'\s*│/gi;

const result = {};
let match;

while ((match = regex.exec(text)) !== null) {
  const selector = match[1];
  const name = match[2];
  result[`0x${selector}`] = name;
}

const tsContent = `export const customErrorMapping: Record<string, string> = ${JSON.stringify(
  result,
  null,
  2
)} as const;
`;

fs.writeFileSync("./../config/customErrorMap.ts", tsContent, "utf8");
console.log(`✅ Successfully parsed ${Object.keys(result).length} entries`);
