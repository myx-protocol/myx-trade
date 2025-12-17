import { ApiResponse } from "../type";
import { http } from "../request";
import { getBaseUrlByEnv } from "../index";

export const getPoolList = async ({
  isProd = true,
}: {
  isProd?: boolean;
}) => {
  return http.get<ApiResponse<any[]>>(
    `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/market/list`
  );
};

export interface PoolSymbolAllResponse {
  chainId: number;
  marketId: string;
  poolId: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseTokenIcon: string;
}
export const getPoolSymbolAll = async ({
  isProd = true,
}: {
  isProd?: boolean;
}) => {
  return http.get<ApiResponse<PoolSymbolAllResponse[]>>(
    `${getBaseUrlByEnv(isProd)}/openapi/gateway/scan/pools`
  );
};
