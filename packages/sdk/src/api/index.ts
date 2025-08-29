import { $fetch } from "@/api/request";
import { getAppEnvConfig } from "@/utils/env";

const { VITE_API_URL } = getAppEnvConfig();
const baseUrl= "https://api-test.myx.cash"



// {
//   "chainId": 421614,
//   "marketId": "0x1ddd0797c40b61b1437e0c455a78470e7c0659ed497d94222425736210f9d08c",
//   "poolId": "0xd7a6e43cc289cb0a53795ca67b10d12abccded3abaada411d9d4dbe78e5fc739",
//   "oracleId": null,
//   "globalId": 20833,
//   "state": 0,
//   "baseSymbol": "ATH",
//   "quoteSymbol": "USDC",
//   "baseDecimals": 18,
//   "quoteDecimals": 6,
//   "baseToken": "0x1428444eacdc0fd115dd4318fce65b61cd1ef399",
//   "quoteToken": "0x7e248ec1721639413a280d9e82e2862cae2e6e28",
//   "basePoolToken": "0x906dd48c39aff16cb8a12a86b51c3b9eddc65a18",
//   "quotePoolToken": "0x012110136c9ad012687c557a9a49779b489262e0",
//   "oracleType": null,
//   "feedId": null,
//   "activeTime": null
// }
export const getPools = async () => {
  return await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);
}
