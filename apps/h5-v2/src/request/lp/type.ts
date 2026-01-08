import {
  type BaseResponse,
  type QuoteLPSortField,
  type TimeInterval,
  type PageRequest,
  type SortOrder,
  type TrenchSortField,
  type PriceInterval,
  PoolType,
  type Rating,
} from '@/request/type.ts'
import { type MarketPoolState, pool } from '@myx-trade/sdk'

export interface PoolOpenOrder {
  amount: string
  chainId: number
  minQuoteOut: string
  orderId: number
  poolId: string
  poolType: pool.PoolType
  triggerPrice: string
  triggerType: pool.TriggerType
  txTime: number
  user: string
}

export interface PoolOpenOrdersResponse extends BaseResponse {
  data: PoolOpenOrder[]
}

export interface TokenSniper {
  tokenIcon: string
  poolId: string
  symbol: string
  decimals: number
  symbolName: string
  priceChange: string
  chainId: number
  marketCap: string
  liquidity: string
  holders: number
  tokenCreateTime: number
  tokenAddress: string
}

export interface TokenSniperResponse extends BaseResponse {
  data: TokenSniper[]
}

export interface NewCook {
  tokenIcon: string
  poolId: string
  symbol: string
  symbolName: string
  basePriceChange: string
  chainId: number
  marketCap: string
  liquidity: string
  holders: number
  progress: string
  tokenCreateTime: number
  baseToken: string
  marketId: string
}

export interface CookNewsResponse extends BaseResponse {
  data: NewCook[]
}

export interface CookSoon {
  tokenIcon: string
  poolId: string
  symbol: string
  symbolName: string
  basePriceChange: string
  chainId: number
  marketCap: string
  liquidity: string
  holders: number
  progress: string
  tokenCreateTime: number
  baseToken: string
  marketId: string
}
export interface CookSoonResponse extends BaseResponse {
  data: CookSoon[]
}

export interface TokenSniper {
  tokenIcon: string
  poolId: string
  symbol: string
  decimals: number
  symbolName: string
  priceChange: string
  chainId: number
  marketCap: string
  liquidity: string
  holders: number
  tokenCreateTime: number
  tokenAddress: string
}
export interface TokenSniperResponse extends BaseResponse {
  data: TokenSniper[]
}

export interface TrenchRequest extends PageRequest {
  timeInterval?: TimeInterval
  chainId?: number
  sortField?: TrenchSortField
  sortOrder?: SortOrder
}

export interface Trench {
  id: number
  tokenIcon: string
  poolId: string
  mSymbol: string
  mBaseQuoteSymbol: string
  lpPriceChange: string
  chainId: number
  tvl: string
  volume: string
  oi: string
  tokenCreateTime: number
  baseToken: string
  marketId: string
  apr: string
  symbol: string
}

export interface TrenchResponse extends BaseResponse {
  data: Trench[]
}

export interface QuotePoolListRequest extends PageRequest {
  timeInterval?: TimeInterval
  chainId?: number
  sortField?: QuoteLPSortField
  sortOrder?: SortOrder
}

export interface QuotePool {
  tokenIcon: string
  poolId: string
  mSymbol: string
  tokenName: string
  chainId: number
  tokenCreateTime: number
  baseToken: string
  quoteToken: string
  marketId: string
  apr: string
  rating: Rating
  avgLpPrice: string
  mQuoteBaseSymbol: string
  symbolName: string
  tvl: string
  id: number
  quotePoolToken: string
}

export interface QuotePoolResponse extends BaseResponse {
  data: QuotePool[]
}

export interface BaseQuoteTopRequest {
  timeInterval?: TimeInterval
  chainId?: number
  sortField: 'tokenCreateTime' | 'rating' | 'baseApr'
}

export interface BaseQuoteTop {
  symbol: string
  rating: Rating
  apr: string
}
export interface BaseQuoteTopResponse extends BaseResponse {
  data: BaseQuoteTop[]
}

export interface BaseLpDetail {
  totalSupply: string
  circulation: string
  marketCap: string
  fdv: string
  holders: number
  traders: number
  liquidity: string
  volume: string
  longPosition: string
  shortPosition: string
  fundingRate: string
  tokenIcon: string
  poolId: string
  mSymbol: string
  symbolName: string
  lpPriceChange: string
  chainId: number
  tokenCreateTime: number
  baseToken: string
  marketId: string
  basePrice: string
  tvl: string
  apr: string
  globalId: number
  mBaseQuoteSymbol: string
  state: MarketPoolState
  poolPreTime: number
  totalTvl: string
}

export interface BaseLpDetailResponse extends BaseResponse {
  data: BaseLpDetail
}

export interface QuoteLpDetail {
  totalSupply: string
  circulation: string
  marketCap: string
  fdv: string
  holders: number
  traders: number
  liquidity: string
  volume: string
  longPosition: string
  shortPosition: string
  fundingRate: string
  tokenIcon: string
  poolId: string
  baseQuoteSymbol: string
  symbolName: string
  lpPriceChange: string
  chainId: number
  tokenCreateTime: number
  quoteToken: string
  quotePoolToken: string
  marketId: string
  lpPrice: string
  tvl: string
  apr: string
  quoteDecimals: number
  quoteSymbol: string
  mBaseQuoteSymbol: string
  mQuoteBaseSymbol: string
  state: MarketPoolState
  poolPreTime?: number
  baseToken?: string
  totalTvl: string
  rating: Rating
  globalId: number
}

export interface QuoteLpDetailResponse extends BaseResponse {
  data: QuoteLpDetail
}

export interface LpPriceHistoryRequest {
  chainId: number
  poolId: string
  token: string
  interval: PriceInterval
  limit: number
}

export interface LpPriceHistory {
  time: number
  value: string
}

export interface LpPriceHistoryResponse extends BaseResponse {
  data: LpPriceHistory[]
}

export interface QuoteAprTop {
  chainId: number
  poolId: string
  tokenIcon: string
  mQuoteBaseSymbol: string
  apr: string
}

export interface QuoteAprTopResponse extends BaseResponse {
  data: QuoteAprTop[]
}

export interface QuotePoolToken {
  tokenIcon: string
  poolId: string
  mSymbol: string
  tokenName: string
  chainId: number
  tokenCreateTime: number
  baseToken: string
  quoteToken: string
  marketId: string
  apr: string
  rating: Rating
  avgLpPrice: string
}

export interface QuotePoolTokenResponse extends BaseResponse {
  data: QuotePoolToken[]
}

export interface QuotePoolTokenRequest extends PageRequest {
  timeInterval?: TimeInterval
  chainId?: number
  sortField?: 'priceChange' | 'apr' | 'tvl' | 'volume' | 'oi' | 'tokenCreateTime'
  sortOrder?: SortOrder
}

export interface QuotePoolTokenTop {
  mQuoteBaseSymbol: string
  rating: Rating
  apr: string
  tokenIcon: string
  poolId: string
  chainId: number
}

export interface QuotePoolTokenTopResponse extends BaseResponse {
  data: QuotePoolTokenTop[]
}

export interface LpAssetsRequest {
  poolType: PoolType
  chainId?: number
  poolId?: string
  poolToken?: string
}

export interface LpAsset {
  tokenIcon: string
  baseSymbol: string
  quoteSymbol: string
  chainId: number
  poolId: string
  poolToken: number
  poolType: number
  avgPrice: string
  lastTotal: string
  token: string
  globalId: number
  marketId: string
}
export interface LpAssetsResponse extends BaseResponse {
  data: LpAsset[]
}

export type PriceMapType = { [poolId: string]: string }

export interface MarketPoolStateData {
  chainId: number
  poolId: string
  string: string
  state: MarketPoolState
  baseToken: string
}

export interface MarketPoolStateDataResponse extends BaseResponse {
  data: MarketPoolStateData[]
}

export interface LevelConfig {
  levelId: number
  name: Rating
  minOrderSizeInUsd: string
  lockSeconds: number
  lockPriceRate: string
  lockLiquidity: string
  fundingFeeSeconds: number
  slip: string
  leverage: number
  maintainCollateralRate: string
  fundingFeeRate1: string
  fundingFeeRate1Max: string
  fundingFeeRate2: string
  assetClass: number
  genesisFeeRate: string
}

export interface MarketPoolRiskLevelConfig {
  level: number
  levelConfig: LevelConfig
  levelName: Rating
}

export interface MarketPoolRiskLevelConfigResponse extends BaseResponse {
  data: MarketPoolRiskLevelConfig
}
