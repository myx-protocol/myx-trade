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
} from "@/api/type";
import { ChainId } from "@/config/chain";
import { addQueryParams } from "./utils";
const baseUrl = "https://api-test.myx.cash";

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
    `${baseUrl}/openapi/scan/position/open?chainId=${chainId}`,
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
    `${baseUrl}/openapi/scan/order/open?chainId=${chainId}`,
    undefined,
    { headers: { myx_openapi_access_token: accessToken } }
  );
};

export const getPoolOpenOrders = async (
  accessToken: string,
  chainId: ChainId
): Promise<PoolOpenOrdersResponse> => {
  return await http.get<PoolOpenOrdersResponse>(
    `${baseUrl}/openapi/scan/market/pool-order/open?chainId=${chainId}`,
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
export * from "./type";
