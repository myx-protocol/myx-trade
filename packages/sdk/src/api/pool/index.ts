import { ApiResponse } from "../type";
import { http } from "../request";
import { getBaseUrlByEnv } from "@/api";

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
}

