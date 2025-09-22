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
export interface BaseResponse {
  code: ErrorCode;
  msg: string | null;
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
  Cook = 0, // 市场建立
  Primed = 1, // 扣款手续费，等待准备oracle
  Trench = 2, // 上架交易
  PreBench = 3, // 预下架
  Bench = 4 // 下架
}

export type MarketPool = {

  "chainId": number,
  "marketId": string,
  "poolId": string,
  "oracleId": number,
  "globalId": number,
  "state": MarketPoolState,
  "baseSymbol": string,
  "quoteSymbol": string,
  "baseDecimals": number,
  "quoteDecimals": number,
  "baseToken": string,
  "quoteToken": string,
  "basePoolToken": string,
  "quotePoolToken": string,
  "oracleType": number,
  "feedId": number,
  "activeTime": number
}
export interface MarketPoolResponse extends BaseResponse {
  data: MarketPool[];
}
export interface PoolResponse extends BaseResponse {
  data: MarketPool;
}

export enum OracleType {
  Pyth,
  Chainlink,
}
export type PriceType = {
  oracleId: number
  price: string
  vaa: string
  publishTime: number
  oracleType?: OracleType
  nativeFee?: number | string
}

export interface PriceResponse extends BaseResponse {
  data: PriceType[];
}


export interface ApiResponse<T=Record<string, any>> extends BaseResponse {
  data: T;
}
