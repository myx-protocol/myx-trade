import type { MarketInfo } from "@/config/market/type";

export const ARB_TEST_SEPOLIA: MarketInfo = {
  marketId: '0x1ddd0797c40b61b1437e0c455a78470e7c0659ed497d94222425736210f9d08c',
  quoteToken: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
  oracleFeeUsd: 400000000n,
  oracleRefundFeeUsd: 300000000n,
  baseReserveRatio: 100,
  quoteReserveRatio: 100,
  poolPrimeThreshold: 20000n,
  decimals: 6
}
