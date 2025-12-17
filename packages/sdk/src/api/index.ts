import { http } from "@/api/request";
import {
  ApiResponse,
  PriceResponse,
  PoolResponse,
  // PositionResponse,
  PoolOpenOrdersResponse,
  // AccessTokenRequest,
  HttpEnvParams,
  HttpKlineIntervalEnum,
  // KlineDataItemType,
  TickerDataItem,
  SearchTypeEnum,
  SearchSecondTypeEnum,
  // SearchResultResponse,
  // FavoritesListItem,
  BaseDetailResponse,
  MarketDetailResponse,
  MarketInfo,
} from "@/api/type";
import { ChainId } from "@/config/chain";
import sdk from "@/web3";



export const getBaseUrlByEnv = (isProd?: boolean) => {
  const _isProd =  !!isProd || !sdk.getConfigManager()?.getConfig()?.isTestnet
  return _isProd ? "https://api.myx.finance" : "https://api-test.myx.cash";
};

export const getForwardUrlByEnv = (isProd?: boolean) => {
  return `${getBaseUrlByEnv(isProd)}/v2/agent`
};


export const getOraclePrice = async (
  chainId: ChainId,
  poolIds: string[] = [],
): Promise<PriceResponse> => {
  if (!!poolIds.length) {
    return http.get(
      `${getBaseUrlByEnv()}/openapi/gateway/quote/price/oracles`,
      {
        chainId,
        poolIds: poolIds.join(","),
      }
    );
  }
  return Promise.reject(new Error("Invalid pool id"));
};

export interface LevelConfig {
  fundingFeeRate1: number;
  fundingFeeRate1Max: number;
  fundingFeeRate2: number;
  fundingFeeSeconds: number;
  leverage: number;
  lockLiquidity: number;
  lockPriceRate: number;
  lockSeconds: number;
  maintainCollateralRate: number;
  minOrderSizeInUsd: number;
  name: string;
  slip: number;
}

export interface PoolLevelConfig {
  level: number;
  levelName: string;
  levelConfig: LevelConfig;
}

export interface GetPoolLevelConfigParams {
  poolId: string;
  chainId: ChainId;
  isProd?: boolean;
}

/**
 * Get Pool Level Config
 */
// export const getPoolLevelConfig = async ({
//   poolId,
//   chainId,
//   isProd = true,
// }: GetPoolLevelConfigParams) => {
//   return http.get<ApiResponse<PoolLevelConfig>>(
//     `${getBaseUrlByEnv(
//       isProd
//     )}/openapi/gateway/risk/market_pool/level_config${addQueryParams({
//       poolId,
//       chainId,
//     })}`
//   );
// };

export const getPoolDetail = async (
  chainId: number,
  poolId: string,
  isProd?: boolean
): Promise<PoolResponse> => {
  return await http.get<PoolResponse>(
    `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/info?chainId=${chainId}&poolId=${poolId}`
  );
};

// export const getPositions = async (
//   accessToken: string,
//   address: string,
//   isProd: boolean = true
// ): Promise<PositionResponse> => {
//   return await http.get<PositionResponse>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/position/open`,
//     undefined, // params
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

// export const getOrders = async (
//   accessToken: string,
//   address: string,
//   isProd: boolean = true
// ): Promise<PositionResponse> => {
//   return await http.get<PositionResponse>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/order/open`,
//     undefined,
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

export const getPoolOpenOrders = async (
  accessToken: string,
  address: string,
  chainId: ChainId,
): Promise<PoolOpenOrdersResponse> => {
  return await http.get<PoolOpenOrdersResponse>(
    `${getBaseUrlByEnv()}/openapi/gateway/scan/market/pool-order/open?chainId=${chainId}`,
    undefined,
    {
      headers: {
        myx_openapi_access_token: accessToken,
        myx_openapi_account: address,
      },
    }
  );
};

/**
 * Get Kline Data
 */
export interface GetKlineDataParams {
  chainId: ChainId;
  poolId: string;
  endTime: number;
  limit: number;
  interval: HttpKlineIntervalEnum;
}

// export const getKlineData = (
//   { chainId, poolId, endTime, limit, interval }: GetKlineDataParams,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<KlineDataItemType[]>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/quote/candles`,
//     {
//       chainId,
//       poolId,
//       endTime,
//       limit,
//       interval,
//     }
//   );
// };

/**
 * Get Kline Latest Bar
 */
// export const getKlineLatestBar = async (
//   params: Pick<GetKlineDataParams, "chainId" | "poolId" | "interval">,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<KlineDataItemType>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/quote/candle/latest`,
//     params
//   );
// };

// Get Ticker Data
export interface GetTickerDataParams {
  chainId: ChainId;
  poolIds: string[];
}

export const getTickerData = async (
  { chainId, poolIds }: GetTickerDataParams,
  envParams: HttpEnvParams
) => {
  const isProd = envParams?.isProd ?? true;
  return http.get<ApiResponse<TickerDataItem[]>>(
    `${getBaseUrlByEnv(isProd)}/openapi/gateway/quote/candle/tickers`,
    {
      chainId,
      poolIds: poolIds.join(","),
    }
  );
};

// // Get ALL Tickers
// export const getAllTickers = async (envParams: HttpEnvParams) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<TickerDataItem[]>>(
//     `${getBaseUrlByEnv(isProd)}/v2/mx-gateway/quote/candle/all_tickers`
//   );
// };

/**
 * search
 */

export interface SearchMarketParams {
  chainId: ChainId | 0; // 0 for all chains
  searchType?: SearchTypeEnum;
  type?: SearchSecondTypeEnum;
  searchKey?: string; // keywords
}
// search market pool
// export const searchMarketAuth = async (
//   { accessToken, address, ...params }: SearchMarketParams & AccessTokenRequest,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<SearchResultResponse>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/ac-search`,
//     params,
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

// export const searchMarket = async (
//   { ...params }: SearchMarketParams,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<SearchResultResponse>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/search`,
//     params
//   );
// };

/**
 * favorite
 */
export interface AddFavoriteParams {
  poolId: string;
  chainId: ChainId;
}

// export const addFavorite = async (
//   { accessToken, address, ...params }: AddFavoriteParams & AccessTokenRequest,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<null>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/add-favorites`,
//     params,
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

export interface RemoveFavoriteParams {
  poolId: string;
  chainId: ChainId;
}

// export const removeFavorite = async (
//   {
//     accessToken,
//     address,
//     ...params
//   }: RemoveFavoriteParams & AccessTokenRequest,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<null>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/cancel-favorites`,
//     params,
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

/**
 * Favorites List
 */
export type FavoritesTimeInterval = "10m" | "1h" | "4h" | "12h" | "24h";

export interface FavoritesListParams {
  poolId?: string;
  before?: number;
  after?: number;
  limit?: number;
  timeInterval?: FavoritesTimeInterval;
  chainId: ChainId | 0;
}

// export const getFavoritesList = async (
//   { accessToken, address, ...params }: FavoritesListParams & AccessTokenRequest,
//   envParams: HttpEnvParams
// ) => {
//   const isProd = envParams?.isProd ?? true;
//   return http.get<ApiResponse<FavoritesListItem[]>>(
//     `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/favorites`,
//     params,
//     {
//       headers: {
//         myx_openapi_access_token: accessToken,
//         myx_openapi_account: address,
//       },
//     }
//   );
// };

export interface GetBaseDetailParams {
  chainId: ChainId;
  poolId: string;
}
export const getBaseDetail = async (
  { ...params }: GetBaseDetailParams
) => {
  return http.get<ApiResponse<BaseDetailResponse>>(
    `${getBaseUrlByEnv()}/openapi/gateway/scan/market/base-details`,
    params
  );
};

export interface GetMarketDetailParams {
  chainId: number;
  poolId: string;
}
export const getMarketDetail = async (
  { ...params }: GetMarketDetailParams
) => {
  return http.get<ApiResponse<MarketDetailResponse>>(
    `${getBaseUrlByEnv()}/openapi/gateway/scan/market/detail`,
    params
  );
};

export const getMarketList = async () => {
  return http.get<ApiResponse<MarketInfo[]>>(
    `${getBaseUrlByEnv()}/openapi/gateway/scan/market`
  );
};

export * from "./type";

export * from "./account";

export * from "./seamless";
export * from "./pool";
