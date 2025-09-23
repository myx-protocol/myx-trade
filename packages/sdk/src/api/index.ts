import { $fetch } from "@/api/request";
import { MarketPoolResponse, PoolResponse, PriceResponse } from "@/api/type";
import { ChainId } from "@/config/chain";
import { addQueryParams } from "@/api/utils";

const baseUrl= "https://api-test.myx.cash"


export const getPools = async (): Promise<MarketPoolResponse> => {
  return await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);
}

export const getOraclePrice = async (chainId:ChainId, poolIds: string[] = []): Promise<PriceResponse> => {
  if (!!poolIds.length){
    
    return await $fetch("GET", `${baseUrl}/openapi/gateway/quote/price/oracles${addQueryParams({
      chainId,
      poolIds: poolIds.join(","),
    })}`);
  }
  return Promise.reject(new Error("Invalid pool id"));
}


export const getPoolDetail = async (chainId: number, poolId: string): Promise<PoolResponse> => {
  return await $fetch("GET", `${baseUrl}/v2/mx-scan/market/detail?chainId=${chainId}&poolId=${poolId}`);
}

export * from "./type";
