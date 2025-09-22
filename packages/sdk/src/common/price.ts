import { getOraclePrice, MarketPoolState, OracleType } from "@/api";
import { ChainId } from "@/config/chain";
import { isNil } from "lodash-es";
import { getBasePoolContract, getPythContract } from "@/web3/providers";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getPoolInfo } from "@/lp/getPoolInfo";

export const getPriceData = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  const rs = await getOraclePrice(chainId, [poolId])
  const data  = rs?.data?.[0]
  if (!data) {
    throw new Error (`Unable to get price for ${poolId} in the deposit`)
  }
  const { publishTime, vaa, oracleType, nativeFee, price } = data
  let value = !isNil(nativeFee) ? BigInt(nativeFee) : 1n
  if (oracleType === OracleType.Pyth) {
    const PythContract = await getPythContract(chainId)
    const v = await PythContract.getUpdateFee([vaa])
    value = v
  }
  
  return {
    price,
    value,
    publishTime,
    oracleType: oracleType ?? OracleType.Pyth,
    vaa,
  }
}


export const getLpPrice = async (chainId:ChainId,poolId: string) => {
  if (!poolId) return
  try {
    const pool = await getPoolInfo (chainId,poolId);
    const contract = await getBasePoolContract(chainId);
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
