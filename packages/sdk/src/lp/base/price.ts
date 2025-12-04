import { ChainId } from "@/config/chain";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { getBasePoolContract } from "@/web3/providers";
import { MarketPoolState } from "@/api";
import { getPriceData } from "@/common/price";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getErrorTextFormError } from "@/config/error";

export const getLpPrice = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  try {
    const pool = await getPoolInfo (chainId,poolId);
    const contract = await getBasePoolContract(chainId);
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
