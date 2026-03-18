import { getAccount, getLiquidityRouterContract } from "@/web3/providers.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.js";
import { parseUnits } from "viem";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import { ChainId } from "@/config/chain.js";
import { MarketPoolState } from "@/api/type.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { COMMON_LP_AMOUNT_DECIMALS } from "@/config/decimals.js";
import { getPublicClient } from "@/web3";


export const transfer = async (chainId:ChainId,fromPoolId:string, toPoolId: string, amount: number) => {
  try {
    const fromPool  = await getPoolInfo(chainId, fromPoolId);
    const toPool  = await getPoolInfo(chainId, toPoolId);
    
    if (!toPool || !fromPool) return null;
    
    
    if([MarketPoolState.PreBench, MarketPoolState.Bench].includes(toPool.state)) {
      throw new Error(Errors[ErrorCode.Invalid_Pool_State]) // todo
    }
    
    const account = await getAccount (chainId);
    const chainInfo =  CHAIN_INFO[chainId];
    const decimals = COMMON_LP_AMOUNT_DECIMALS
    
    await checkParams({chainId, amount,account, decimals, tokenAddress: fromPool.quotePoolToken})
    
    const data = {
      fromPoolId,
      toPoolId,
      minLpOut: 0n,
      amount: parseUnits(amount.toString(), decimals),
    }
    // console.log('migrateLiquiditydata', data)
    const contract = await getLiquidityRouterContract(chainId)
    // estimate gas (viem style, args array)
    const _gasLimit =  await contract.estimateGas!.migrateLiquidity([data])
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const hash = await contract.write!.migrateLiquidity([data], {
      gasLimit,
      gasPrice
    })
    
    const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
    
    return receipt
  } catch (error) {
    // console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
