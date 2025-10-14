import { ChainId } from "@/config/chain";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";
import { getPoolManagerContract } from "@/web3/providers";
import { checkParams } from "@/common/checkParams";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common";
import { getPoolInfo } from "@/lp/getPoolInfo";

export const reprime = async (chainId: ChainId, poolId: string) => {
  try {
    await checkParams({chainId})
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    
    await checkParams ({
      tokenAddress: pool.quoteToken,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getPoolManagerContract(chainId)
    const _gasLimit = await contract.reprimePool.estimateGas({ poolId })
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    console.log("gasPrice", gasPrice)
    
    const request = await contract.reprimePool({poolId})
    console.log("PoolManager.reprimePool request", request);
    
    const receipt = await request?.wait()
    console.log(receipt)
    return receipt;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
