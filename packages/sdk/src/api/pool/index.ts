import { ApiResponse } from "../type";
import { http } from "../request";
import { baseUrl } from "../index";

export const getPoolList = async () => {
  return http.get<ApiResponse<any[]>>(
    `${baseUrl}/openapi/gateway/scan/market/list`
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
export const getPoolSymbolAll = async () => {
  return http.get<ApiResponse<PoolSymbolAllResponse[]>>(
    `${baseUrl}/openapi/gateway/scan/pools`
  );
};
