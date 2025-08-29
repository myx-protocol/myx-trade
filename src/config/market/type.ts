import { Address } from "@/config/chain";

export interface MarketInfo {
  readonly marketId: string,
  readonly quoteToken:Address,
  readonly oracleFeeUsd:bigint,
  readonly oracleRefundFeeUsd:bigint,
  readonly baseReserveRatio:number,
  readonly quoteReserveRatio:number,
  readonly poolPrimeThreshold: bigint,
}
