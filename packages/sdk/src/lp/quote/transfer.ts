import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { parseUnits } from "ethers";
import { Market } from "@/config/market";
import { CHAIN_INFO } from "@/config/chains";
import { checkParams } from "@/common/checkParams";
import { getPools } from "@/api";
import { ChainId } from "@/config/chain";
import { MarketPoolState } from "@/api/type";
import { ErrorCode, Errors } from "@/config/error";
import { getPoolInfo } from "@/lp/getPoolInfo";


export const transfer = async (chainId:ChainId,fromPoolId:string, toPoolId: string, amount: number) => {
  try {
    const fromPool  = await getPoolInfo(fromPoolId);
    const toPool  = await getPoolInfo(toPoolId);
    
    if (!toPool || !fromPool) return null;
    
    
    if([MarketPoolState.PreBench, MarketPoolState.Bench].includes(toPool.state)) {
      throw new Error(Errors[ErrorCode.Invalid_Pool_State]) // todo
    }
    
    const account = await getAccount (chainId);
    
    await checkParams({chainId, amount,account, tokenAddress: fromPool.quotePoolToken})
    
    const chainInfo =  CHAIN_INFO[chainId];
    const decimals = Market[chainId].lpDecimals
    const data = {
      fromPoolId,
      toPoolId,
      minLpOut: 0n,
      amount: parseUnits(amount.toString(), decimals),
    }
    console.log('migrateLiquiditydata', data)
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract.migrateLiquidity.estimateGas(data)
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract.migrateLiquidity(data, {
      gasLimit,
      gasPrice
    })
    console.log("migrateLiquidity",result)
    return result
  } catch (e) {
    console.error(e)
  }
}
