import { ChainId } from "@/config/chain";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { getBasePoolContract, getQuotePoolContract } from "@/web3/providers";
import { MarketPoolState } from "@/api";
import { getPriceData } from "@/common/price";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";

export const getLpPrice = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  try {
    const pool = await getPoolInfo (chainId,poolId);
    const contract = await getQuotePoolContract(chainId);
    let price = 0n
    if (!(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)) {
      const res = await getPriceData(chainId, poolId)
      if (res?.price) {
        price = parseUnits(res.price, COMMON_PRICE_DECIMALS)
      }
    }
    
    const data = await contract.getPoolTokenPrice(poolId, price)
    console.log( `pool ${poolId} price: `, data)
    return data
  } catch (e) {
    console.error(e)
    throw e
  }
}
