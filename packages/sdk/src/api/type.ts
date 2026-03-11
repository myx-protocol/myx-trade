import { Direction } from "@/types/trading";
import { PoolType, TriggerType } from "@/lp/pool";
import { ChainId } from "@/config/chain";
export interface ObjectType<T> {
  [key: string]: T;
}
export type Address = `0x${string}`;
export type NetWorkFee = {
  paymentType: number;
  volScale: number;
};
export enum ErrorCode {
  SUCCESS = 9200,
  SUCCESS_ORIGIN = 0,
  IDENTITY_VERIFICATION_FAILED = 9401,
  PERMISSION_DENIED = 9403,
  NOT_EXIST = 9404,
  REQUEST_LIMIT = 9429,
  SERVICE_ERROR = 9500,
  MISS_REQUESTED_PARAMETER = 9900,
  INVALID_PARAMETER = 9901,
  NETWORK_ERROR = "ERR_NETWORK",
}
export interface BaseResponse<T = any> {
  code: ErrorCode;
  msg: string | null;
  data?: T;
}

export type DashboardType = {
  lpAsset: string;
  cumTradeAmount: string;
  cumEarnings: string;
  accountCount: number;
  positionAmount: string;
  positionAmountRate: string | number;
  accountCountRate: string | number;
  tradeAmountRate: number | string;
  lpAssetRate: string | number;
  earningsRate: string | number;
};

export interface StatDashBoardResponse extends BaseResponse {
  data: DashboardType;
}

export type AccessTokenType = {
  accessToken: string;
  expireAt: number;
  allowAccount: string;
  appId: string;
};

export interface AccessTokenResponse extends BaseResponse {
  data: AccessTokenType;
}

export enum MarketPoolState {
  Cook = 0,     // Market created
  Primed = 1,   // Fee charged, waiting for oracle initialization
  Trench = 2,   // Trading enabled
  PreBench = 3, // Pending delisting
  Bench = 4,    // Delisted
}

export type MarketPool = {
  chainId: number;
  marketId: string;
  poolId: string;
  oracleId?: number | null;
  globalId: number;
  state: MarketPoolState;
  baseSymbol: string;
  quoteSymbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  baseToken: string;
  quoteToken: string;
  basePoolToken: string;
  quotePoolToken: string;
  oracleType?: number | null;
  feedId?: number | null;
  activeTime: number;
  poolPreTime: number;
};
export interface MarketPoolResponse extends BaseResponse {
  data: MarketPool[];
}
export interface PoolResponse extends BaseResponse {
  data: MarketPool;
}

export enum OracleType {
  Chainlink = 1,
  Pyth,
}
export type PriceType = {
  oracleId: number;
  price: string;
  vaa: string;
  publishTime: number;
  oracleType?: OracleType;
  nativeFee?: number | string;
  poolId: string;
};

export interface PriceResponse extends BaseResponse {
  data: PriceType[];
}

export interface ApiResponse<T = Record<string, any>> extends BaseResponse {
  data: T;
}

export interface PositionType {
  poolId: string;
  positionId: string;
  direction: Direction;
  entryPrice: string;
  fundingRateIndex: string;
  size: string;
  riskTier: number;
  collateralAmount: string;
  txTime: number;
}

export interface PositionResponse extends BaseResponse {
  data: PositionType[];
}

export interface PoolOpenOrder {
  amount: string;
  chainId: number;
  minQuoteOut: string;
  orderId: number;
  poolId: string;
  poolType: PoolType;
  triggerPrice: string;
  triggerType: TriggerType;
  txTime: number;
  user: string;
}

export interface PoolOpenOrdersResponse extends BaseResponse {
  data: PoolOpenOrder[];
}

export interface AccessTokenRequest {
  accessToken: string;
  address: string;
}

export interface HttpEnvParams {
  isProd?: boolean
}

export enum HttpKlineIntervalEnum {
  Minute1 = 1,
  Minute5 = 5,
  Minute15 = 15,
  Minute30 = 30,
  Hour1 = 60,
  Hour4 = 240,
  Day1 = 1440,
  Week1 = 10080,
  Month1 = 40320,
}

export interface KlineDataItemType {
  time: number;
  open: string;
  close: string;
  high: string;
  low: string;
}

export interface TickerDataItem {
  chainId: ChainId;
  poolId: string;
  oracleId: number;
  price: string;
  change: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
}

export enum MarketType {
  Contract = 1,
  Cook = 2,
  Earn = 3,
}
export enum SearchTypeEnum {
  All = 0,
  Contract = MarketType.Contract,
  Cook = MarketType.Cook,
  Earn = MarketType.Earn,
}

export enum MarketCapType {
  BlueChips = 1,
  Alpha = 2,
}
export enum SearchSecondTypeEnum {
  BlueChips = MarketCapType.BlueChips,
  Alpha = MarketCapType.Alpha,
  Favorite = 3,
}

export interface ChainIdRequest {
  chainId: ChainId;
}

export type FavoritesType = -1 | 1;

export interface SearchResultContractItem {
  chainId: ChainId;
  poolId: string;
  baseQuoteSymbol: string;
  symbolName: string;
  baseToken: Address;
  tokenIcon: string;
  type: MarketType;
  capType: MarketCapType;
  favorites: FavoritesType;
  volume: string;
  liquidity: string;
  basePrice: string;
  priceChange: string;
  tvl: string;
  marketCap: string;
  globalId: number;
  baseSymbol: string;
  quoteSymbol: string;
}

export interface SearchResultCookItem {
  chainId: ChainId;
  poolId: string;
  mBaseQuoteSymbol: string;
  symbolName: string;
  baseToken: Address;
  tokenIcon: string;
  type: MarketType;
  state: MarketPoolState;
  tvl: string;
  marketCap: string;
  lpPrice: string;
  lpPriceChange: string;
  globalId: number;
}

export interface SearchResultEarnItem {
  chainId: ChainId;
  poolId: string;
  mQuoteBaseSymbol: string;
  symbolName: string;
  baseToken: Address;
  tokenIcon: string;
  type: MarketType;
  state: MarketPoolState;
  rating: string;
  tvl: string;
  marketCap: string;
  apr: string;
  globalId: number;
}

export interface SearchResultResponse {
  earnInfo: {
    list: SearchResultEarnItem[];
    total: number;
  };
  cookInfo: {
    list: SearchResultCookItem[];
    total: number;
  };
  contractInfo: {
    list: SearchResultContractItem[];
    total: number;
  };
}

// favorites list
export interface FavoritesListItem {
  ChainId: ChainId;
  poolId: string;
  symbolName: string;
  tokenIcon: string;
  capType: MarketCapType;
  baseToken: Address;
  basePrice: string;
  priceChange: string;
  volume: string;
  marketCap: string;
  baseQuoteSymbol: string;
  favorites: FavoritesType;
}

// base detail
export interface BaseDetailResponse {
  totalSupply: string;
  circulation: string;
  marketCap: string;
  fdv: string;
  holders: number;
  traders: number;
  liquidity: string;
  volume: string;
  longPosition: number;
  shortPosition: number;
  fundingRate: string;
  tokenIcon: string;
  poolId: string;
  mSymbol: string;
  symbolName: string;
  lpPriceChange: string;
  chainId: number;
  tokenCreateTime: number;
  baseToken: Address;
  marketId: string;
  basePrice: string;
  tvl: string;
  apr: string;
}

// market detail
export interface MarketDetailResponse {
  chainId: number;
  marketId: string;
  poolId: string;
  oracleId: number;
  globalId: number;
  state: MarketPoolState;
  baseSymbol: string;
  quoteSymbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  baseToken: Address;
  quoteToken: Address;
  basePoolToken: Address;
  quotePoolToken: Address;
  oracleType: OracleType;
  feedId: string;
  activeTime: number;
  capType: MarketCapType;
  baseReserveRatio: string;
  quoteReserveRatio: string;
}

export interface MarketInfo {
  chainId: number;
  marketId: string;
  poolId: string;
  quoteSymbol: string;
  quoteDecimals: number;
  quoteToken: string;
  baseReserveRatio: number;
  quoteReserveRatio: number;
  oracleFeeUsd: number;
  oracleRefundFeeUsd: number;
  poolPrimeThreshold: number;
  decimals: number;
}
