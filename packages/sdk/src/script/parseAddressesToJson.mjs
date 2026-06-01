import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawText = fs.readFileSync(path.join(__dirname, "MYX v2合约地址.md"), "utf8");
// Normalize: remove backslash escapes (\_ \( \) \. \-) used in markdown
const text = rawText.replace(/\\([_().\-])/g, "$1");

// PYTH is an external address, not from the md file
const PYTH = {
  421614: '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF',  // ARB_TESTNET
  59141: '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729',   // LINEA_SEPOLIA
  97: '0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb',      // BSC_TESTNET
  56: '0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594',      // BSC_MAINNET
}
// Mapping: md section name → output file name and export name
const envMapping = [
  { section: "test_arbitrum_sepolia", file: "ARB_TEST_SEPOLIA.ts", exportName: "ARB_TEST_SEPOLIA", chainId: 421614 },
  { section: "test_linea_sepolia", file: "LINEA_SEPOLIA.ts", exportName: "LINEA_SEPOLIA", chainId: 59141 },
  { section: "test_bsc_testnet", file: "BSC_TEST_NET.ts", exportName: "BSC_TEST_NET", chainId: 97 },
  { section: "beta_arbitrum_sepolia", file: "ARB_BETA_SEPOLIA.ts", exportName: "ARB_BETA_SEPOLIA", chainId: 421614 },
  { section: "beta_bsc_testnet", file: "BSC_BETA_NET.ts", exportName: "BSC_BETA_NET", chainId: 97 },
  { section: "prod_bsc_mainnet", file: "BSC_MAINET_NET.ts", exportName: "BSC_MAINNET", chainId: 56 },
];

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Extract the tag version string from the section header.
 */
function extractTagForSection(sectionName) {
  const tagRegex = new RegExp(
    `###\\s+${sectionName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s+\\(tag:\\s*([^)]+)\\)`,
    "i"
  );
  const match = text.match(tagRegex);
  if (!match) return "unknown";
  return match[1].trim();
}


/**
 * Extract JSON block for a given section name from the markdown.
 * Sections are marked as ### section_name (tag: ...)
 */
function extractJsonForSection(sectionName) {
  const sectionRegex = new RegExp(
    `###\\s+${sectionName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s+\\(tag:[^)]*\\)[^\`]*\`\`\`JSON\\s*\\n([\\s\\S]*?)\`\`\``,
    "i"
  );
  const match = text.match(sectionRegex);
  if (!match) {
    console.warn(`⚠️  Section "${sectionName}" not found or has empty JSON`);
    return null;
  }

  let jsonStr = match[1].trim();
  // Some sections in the md don't have wrapping braces
  if (!jsonStr.startsWith("{")) {
    jsonStr = `{${jsonStr}}`;
  }
  // Remove trailing commas before closing brace
  jsonStr = jsonStr.replace(/,\s*}/g, "}");

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(`❌ Failed to parse JSON for section "${sectionName}":`, e.message);
    return null;
  }
}

/**
 * Resolve the USDC/ERC20 token address from the JSON data.
 * Priority: Token-USDC > Token-USDT > Token-BUSD
 */
function resolveStableToken(data) {
  return data["Token-USDC"] || data["Token-USDT"] || data["Token-BUSD"] || "";
}

function generateTsFile(exportName, data, pythValue, tag) {
  const stableToken = resolveStableToken(data);

  const fields = [
    { key: "USDC", value: stableToken },
    { key: "POOL_MANAGER", value: data["PoolManager"] || "" },
    { key: "Account", value: data["Account"] || "" },
    { key: "POSITION_MANAGER", value: data["PositionManager"] || "" },
    { key: "ORDER_MANAGER", value: data["OrderManager"] || "" },
    { key: "PYTH", value: pythValue, comment: "// Not a Pyth Adapter" },
    { key: "ERC20", value: stableToken },
    { key: "LIQUIDITY_ROUTER", value: data["LiquidityRouter"] || "" },
    { key: "BASE_POOL", value: data["BasePool"] || "" },
    { key: "QUOTE_POOL", value: data["QuotePool"] || "" },
    { key: "ORACLE", value: data["MYXOracle"] || "", comment: "// MYXOracle" },
    { key: "EIP7702Delegation", value: data["EIP7702Delegation"] || "" },
    { key: "MARKET_MANAGER", value: data["MarketManager"] || "" },
    { key: "DATA_PROVIDER", value: data["DataProvider"] || "" },
    { key: "ORACLE_RESERVE", value: data["OracleReserve"] || "" },
    { key: "FORWARDER", value: data["Forwarder"] || "" },
    { key: "TRADING_ROUTER", value: data["TradingRouter"] || "" },
    { key: "REIMBURSEMENT", value: data["Reimbursement"] || "" },
    { key: "DISPUTE_COURT", value: data["DisputeCourt"] || "" },
    { key: "EXECUTION_POOL", value: data["ExecutionPool"] || ZERO_ADDRESS },
  ];

  const lines = fields.map(({ key, value, comment }) => {
    const suffix = comment ? `  ${comment}` : "";
    return `  ${key}: '${value}',${suffix}`;
  });

  return `// Contract version: ${tag}
import { ContractAddress } from "@/config/chain.js";

export const ${exportName}: ContractAddress = {
${lines.join("\n")}
}
`;
}

const outputDir = path.join(__dirname, "..", "config", "address");

let successCount = 0;
for (const { section, file, exportName, chainId } of envMapping) {
  const data = extractJsonForSection(section);
  if (!data) {
    continue;
  }

  const outputPath = path.join(outputDir, file);
  const tag = extractTagForSection(section);
  const tsContent = generateTsFile(exportName, data, PYTH[chainId] || '', tag);
  fs.writeFileSync(outputPath, tsContent, "utf8");
  console.log(`✅ Generated ${file} (${exportName}) [${tag}]`);
  successCount++;
}

console.log(`\n🎉 Done! Generated ${successCount}/${envMapping.length} address files.`);
