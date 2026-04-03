import { ApiResponse } from "../type.js";
import { http } from "../request.js";
import { getBaseUrlByEnv } from "@/api/index.js";

export const getPoolList = async () => {
  return http.get<ApiResponse<any[]>>(
    `${getBaseUrlByEnv()}/openapi/gateway/scan/market/list`
  );
};

export interface PoolSymbolAllResponse {
  chainId: number;
  marketId: string;
  poolId: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseTokenIcon: string;
  baseToken: string
  quoteToken: string
  baseDecimals: number
  quoteDecimals: number
}

