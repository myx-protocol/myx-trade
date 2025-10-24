// parseTableToJson.js
import fs from "fs";

// 从文件读取原始表格文本（你也可以改为直接粘贴在下面的 template 字符串里）
const text = fs.readFileSync("./errors", "utf8");

// 正则匹配：│ 任意空格 数字 │ '事件名' │ '选择器' │
const regex = /│\s*\d+\s*│\s*'([^']+)'\s*│\s*'([0-9a-f]{8})'\s*│/gi;

const result = {};
let match;

while ((match = regex.exec(text)) !== null) {
  const name = match[1];
  const selector = match[2];
  result[`0x${selector}`] = name;
}

// ✅ 转为 TypeScript 文件内容
const tsContent = `export const customErrorMapping: Record<string, string> = ${JSON.stringify(
  result,
  null,
  2
)} as const;
`;

fs.writeFileSync("./../config/customErrorMap.ts", tsContent, "utf8");

console.log(`✅ 成功解析 ${Object.keys(result).length} 条，输出到 errors.ts`);
