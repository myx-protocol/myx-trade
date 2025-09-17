/**
 * Pool related types and interfaces
 */

// Pool information
export interface Pool {
  poolId: string;
  baseToken: string;
  quoteToken: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  maxLeverage: number;
  state: number;
  createdAt?: number;
  updatedAt?: number;
}

// Pool state enum
export const PoolState = {
  INACTIVE: 0,     // 非活跃
  ACTIVE: 1,       // 活跃
  TRADEABLE: 2,    // 可交易
  SUSPENDED: 3,    // 暂停
  MAINTENANCE: 4   // 维护中
} as const;
export type PoolState = typeof PoolState[keyof typeof PoolState];

// Pool level configuration
export interface PoolLevelConfig {
  name: string;
  minOrderSizeInUsd: number;
  lockSeconds: number;
  lockPriceRate: number;
  lockLiquidity: number;
  maintainCollateralRate: number;
  leverage: number;
  fundingFeeRate1: number;
  fundingFeeRate1Max: number;
  fundingFeeRate2: number;
  fundingFeeSeconds: number;
  slip: number;
}

// Pool level information
export interface PoolLevel {
  level: number;
  levelName: string;
  levelConfig: PoolLevelConfig;
}

// Pool statistics
export interface PoolStats {
  poolId: string;
  totalVolume24h: string;
  totalTrades24h: number;
  totalLiquidity: string;
  openInterest: string;
  fundingRate: string;
  indexPrice: string;
  markPrice: string;
  lastPrice: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  high24h: string;
  low24h: string;
  timestamp: number;
}

// Pool liquidity information
export interface PoolLiquidity {
  poolId: string;
  totalLiquidity: string;
  availableLiquidity: string;
  utilization: string;
  apy: string;
  timestamp: number;
}

// Pool fee structure
export interface PoolFees {
  poolId: string;
  makerFee: string;
  takerFee: string;
  fundingFeeRate: string;
  borrowingFeeRate: string;
  liquidationFee: string;
}

// Oracle price information
export interface OraclePrice {
  poolId: string;
  price: string;
  timestamp: number;
  source: string;
  confidence: number;
}

// Pool risk parameters
export interface PoolRiskParams {
  poolId: string;
  maxLeverage: number;
  initialMarginRate: number;
  maintainanceMarginRate: number;
  liquidationThreshold: number;
  maxOpenInterest: string;
  maxDailyChange: string;
}

// Pool query parameters
export interface PoolQueryParams {
  state?: PoolState;
  baseSymbol?: string;
  quoteSymbol?: string;
  minLeverage?: number;
  maxLeverage?: number;
  limit?: number;
  offset?: number;
}
