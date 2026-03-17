import { ChainId } from "@/config/chain.js";
import { getQuotePoolContract } from "@/web3/providers.js";
import { getPriceData } from "@/common/price.js";
import { parseUnits } from "viem";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";

export const getLpPrice = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  try {
    const contract = await getQuotePoolContract(chainId);
    let price = 0n
    // if (!(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)) {
      const res = await getPriceData(chainId, poolId)
      if (res?.price) {
        price = parseUnits(res.price, COMMON_PRICE_DECIMALS)
      }
    // }
    
    const data = await contract.getPoolTokenPrice(poolId, price)
    // console.log( `pool ${poolId} price: `, data)
    return data
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
