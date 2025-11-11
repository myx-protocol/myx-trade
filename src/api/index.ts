import { http } from "@/api/request";
import {
  ApiResponse,
  MarketPoolResponse,
  PriceResponse,
  PoolResponse,
  PositionResponse,
  PoolOpenOrdersResponse,
  AccessTokenRequest,
  HttpKlineIntervalEnum,
  KlineDataItemType,
  TickerDataItem,
  SearchTypeEnum,
  SearchSecondTypeEnum,
  SearchResultResponse,
  ChainIdRequest,
  FavoritesListItem,
  BaseDetailResponse,
  MarketDetailResponse,
} from "@/api/type";
import { ChainId } from "@/config/chain";
import { addQueryParams } from "./utils";
// todo @JC
export const baseUrl = "https://api-test.myx.cash";

/**
 * Get pools
 */
export const getPools = async (): Promise<MarketPoolResponse> => {
  return http.get(`${baseUrl}/v2/mx-scan/market/list`);
};

export const getOraclePrice = async (
  chainId: ChainId,
  poolIds: string[] = []
): Promise<PriceResponse> => {
  if (!!poolIds.length) {
    return http.get(`${baseUrl}/openapi/gateway/quote/price/oracles`, {
      chainId,
      poolIds: poolIds.join(","),
    });
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
}

/**
 * Get Pool Level Config
 */
export const getPoolLevelConfig = async ({
  poolId,
  chainId,
}: GetPoolLevelConfigParams) => {
  return http.get<ApiResponse<PoolLevelConfig>>(
    `${baseUrl}/openapi/gateway/risk/market_pool/level_config${addQueryParams({
      poolId,
      chainId,
    })}`
  );
};

export const getPoolDetail = async (
  chainId: number,
  poolId: string
): Promise<PoolResponse> => {
  return await http.get<PoolResponse>(
    `${baseUrl}/v2/mx-scan/market/detail?chainId=${chainId}&poolId=${poolId}`
  );
};

export const getPositions = async (
  accessToken: string,
  chainId: ChainId
): Promise<PositionResponse> => {
  return await http.get<PositionResponse>(
    `${baseUrl}/openapi/gateway/scan/position/open?chainId=${chainId}`,
    undefined, // params
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

export const getOrders = async (
  accessToken: string,
  chainId: ChainId
): Promise<PositionResponse> => {
  return await http.get<PositionResponse>(
    `${baseUrl}/openapi/gateway/scan/order/open?chainId=${chainId}`,
    undefined,
    { headers: { myx_openapi_access_token: accessToken } }
  );
};

export const getPoolOpenOrders = async (
  accessToken: string,
  chainId: ChainId
): Promise<PoolOpenOrdersResponse> => {
  return await http.get<PoolOpenOrdersResponse>(
    `${baseUrl}/openapi/gateway/scan/market/pool-order/open?chainId=${chainId}`,
    undefined,
    { headers: { myx_openapi_access_token: accessToken } }
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

export const getKlineData = ({
  chainId,
  poolId,
  endTime,
  limit,
  interval,
}: GetKlineDataParams) => {
  return http.get<ApiResponse<KlineDataItemType[]>>(
    `${baseUrl}/openapi/gateway/quote/candles`,
    {
      chainId,
      poolId,
      endTime,
      limit,
      interval,
    }
  );
};

/**
 * Get Kline Latest Bar
 */
export const getKlineLatestBar = async (
  params: Pick<GetKlineDataParams, "chainId" | "poolId" | "interval">
) => {
  return http.get<ApiResponse<KlineDataItemType>>(
    `${baseUrl}/openapi/gateway/quote/candle/latest`,
    params
  );
};

// Get Ticker Data
export interface GetTickerDataParams {
  chainId: ChainId;
  poolIds: string[];
}

export const getTickerData = async ({
  chainId,
  poolIds,
}: GetTickerDataParams) => {
  return http.get<ApiResponse<TickerDataItem[]>>(
    `${baseUrl}/openapi/gateway/quote/candle/tickers`,
    {
      chainId,
      poolIds: poolIds.join(","),
    }
  );
};

// Get ALL Tickers
export const getAllTickers = async () => {
  return http.get<ApiResponse<TickerDataItem[]>>(
    `${baseUrl}/v2/mx-gateway/quote/candle/all_tickers`
  );
};

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
export const searchMarketAuth = async ({
  accessToken,
  ...params
}: SearchMarketParams & AccessTokenRequest) => {
  return http.get<ApiResponse<SearchResultResponse>>(
    `${baseUrl}/openapi/gateway/scan/market/ac-search`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

export const searchMarket = async ({ ...params }: SearchMarketParams) => {
  return http.get<ApiResponse<SearchResultResponse>>(
    `${baseUrl}/openapi/gateway/scan/market/search`,
    params
  );
};

/**
 * favorite
 */
export interface AddFavoriteParams {
  poolId: string;
  chainId: ChainId;
}

export const addFavorite = async ({
  accessToken,
  ...params
}: AddFavoriteParams & AccessTokenRequest) => {
  return http.get<ApiResponse<null>>(
    `${baseUrl}/openapi/gateway/scan/market/add-favorites`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

export interface RemoveFavoriteParams {
  poolId: string;
  chainId: ChainId;
}

export const removeFavorite = async ({
  accessToken,
  ...params
}: RemoveFavoriteParams & AccessTokenRequest) => {
  return http.get<ApiResponse<null>>(
    `${baseUrl}/openapi/gateway/scan/market/cancel-favorites`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

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

export const getFavoritesList = async ({
  accessToken,
  ...params
}: FavoritesListParams & AccessTokenRequest) => {
  return http.get<ApiResponse<FavoritesListItem[]>>(
    `${baseUrl}/openapi/gateway/scan/market/favorites`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

export interface GetBaseDetailParams {
  chainId: ChainId;
  poolId: string;
}
export const getBaseDetail = async (params: GetBaseDetailParams) => {
  return http.get<ApiResponse<BaseDetailResponse>>(
    `${baseUrl}/openapi/gateway/scan/market/base-details`,
    params
  );
};

export interface GetMarketDetailParams {
  chainId: number;
  poolId: string;
}
export const getMarketDetail = async (params: GetMarketDetailParams) => {
  return http.get<ApiResponse<MarketDetailResponse>>(
    `${baseUrl}/openapi/gateway/scan/market/detail`,
    params
  );
};

export * from "./type";

export * from './account'