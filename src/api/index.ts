import { http } from "@/api/request";
import {
  ApiResponse,
  MarketPoolResponse,
  PriceResponse,
  PoolResponse,
  PositionResponse,
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

export const getPositions = async (accessToken: string, chainId: ChainId): Promise<PositionResponse> => {
  return await http.get<PositionResponse>(
    `${baseUrl}/openapi/scan/position/open?chainId=${chainId}`,
    undefined, // params
    {
      headers: {
        'myx_openapi_access_token': accessToken,
      },
    }
  );
};

export const getOrders = async (accessToken: string, chainId: ChainId): Promise<PositionResponse> => {
  return await http.get<PositionResponse>(
    `${baseUrl}/openapi/scan/order/open?chainId=${chainId}`,
    undefined,
    { headers: { 'myx_openapi_access_token': accessToken } }
  );
};

export * from "./type";
