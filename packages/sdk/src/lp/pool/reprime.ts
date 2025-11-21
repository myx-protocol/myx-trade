import { ChainId } from "@/config/chain";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";
import { getAccount, getPoolManagerContract } from "@/web3/providers";
import { checkParams } from "@/common/checkParams";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common";
import { getPoolInfo } from "@/lp/getPoolInfo";
import Address from "@/config/address";
import { getOracleFee } from "@/lp/market";
import { getMarketInfo } from "./get";
import { formatUnits } from "ethers";

export const reprime = async (chainId: ChainId, poolId: string, marketId:string) => {
  try {
    await checkParams({chainId})
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const account = await getAccount (chainId);
    const _amount = await getOracleFee(chainId, marketId);
    
    if (!_amount) {
      throw new Error('Invalid Market');
    }
    // console.log(Number(formatUnits(_amount, pool.quoteDecimals)))
    
    await checkParams ({
      tokenAddress: pool.quoteToken,
      contractAddress: Address[chainId as keyof typeof Address].ORACLE_RESERVE,
      decimals: pool.quoteDecimals,
      account,
      chainId,
      amount: Number(formatUnits(_amount, pool.quoteDecimals)),
    })
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getPoolManagerContract(chainId)
    const _gasLimit = await contract.reprimePool.estimateGas({ poolId })
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const request = await contract.reprimePool({poolId})
    // console.log("PoolManager.reprimePool request", request);
    
    const receipt = await request?.wait()
    // console.log(receipt)
    return receipt;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
