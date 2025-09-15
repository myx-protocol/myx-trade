import { $fetch } from "@/api/request";
import { MarketPoolResponse, PriceResponse } from "@/api/type";
import { ChainId } from "@/config/chain";
import { addQueryParams } from "@/api/utils";

const baseUrl= "https://api-test.myx.cash"


export const getPools = async (): Promise<MarketPoolResponse> => {
  return await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);
}

export const getPrice = async (chainId:ChainId, poolIds: string[] = []): Promise<PriceResponse> => {
  if (!!poolIds.length){
    
    return await $fetch("GET", `${baseUrl}/v2/mx-gateway/quote/price/oracles${addQueryParams({
      chainId,
      poolIds: poolIds.join(","),
    })}`);
  }
  return Promise.reject(new Error("Invalid pool id"));
}


export * from "./type";
