import { getOraclePrice, OracleType, type PriceType } from "@/api/index.js";
import { ChainId } from "@/config/chain";
import { isNil } from "lodash-es";
// import {  getPythContract } from "@/web3/providers";
const parsePriceData = async (chainId: ChainId, data: PriceType[]) => {
  const result = await Promise.all(
    data.map(async (item) => {
      const { publishTime, vaa, oracleType, nativeFee, price, poolId } = item
      let value = !isNil(nativeFee) ? BigInt(nativeFee) : 1n

      // if (oracleType === OracleType.Pyth) {
      //   const PythContract = await getPythContract(chainId)
      //   const v = await PythContract.getUpdateFee([vaa])
      //   value = v
      // }

      return {
        poolId,
        price,
        value,
        publishTime,
        oracleType: oracleType ?? OracleType.Pyth,
        vaa,
      }
    })
  )

  return result
}

export const getPricesData = async (chainId: ChainId, poolIds: string[]) => {
  if (!poolIds || !poolIds.length) return
  const rs = await getOraclePrice(chainId, poolIds)
  const result = await parsePriceData(chainId, rs.data)
  return result
}
export const getPriceData = async (chainId: ChainId, poolId: string) => {
  if (!poolId) return
  const rs = await getOraclePrice(chainId, [poolId])
  const data = rs?.data?.[0]
  if (!data) {
    throw new Error(`Unable to get price for ${poolId}`)
  }

  const result = await parsePriceData(chainId, [data])
  return result?.[0]
}

