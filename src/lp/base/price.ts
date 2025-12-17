import { ChainId } from "@/config/chain";
import { getBasePoolContract } from "@/web3/providers";
import { getPriceData } from "@/common/price";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getErrorTextFormError } from "@/config/error";

export const getLpPrice = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  try {
    const contract = await getBasePoolContract(chainId);
    let price = 0n
    // if (!(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)) {
      // todo cici
      // @ts-ignore
      const res = await getPriceData(chainId, poolId, true)
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
