import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import {parseUnits } from "ethers";
import { WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { Market } from "@/config/market";
import { checkParams } from "@/common/checkParams";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { previewBaseAmountOut } from "@/lp/base/preview";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { MarketPoolState } from "@/api";

export const withdraw = async (
  params: WithdrawParams
) => {
  try {
    const { chainId, poolId, amount, slippage = 0.01} = params;
    const pool = await getPoolInfo(poolId)
    const lpAddress = pool?.quotePoolToken
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = Market[chainId as keyof typeof Market].lpDecimals;
    
    await checkParams ({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits(amount.toString(), decimals);
    const amountOut = await previewBaseAmountOut({
      chainId,
      poolId,
      amountIn,
    })
    
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage) ,
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    if (isNeedPrice) {
      // estimateGas
      const _gasLimit = await contract["withdrawBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"].estimateGas([], data)
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
      const response = await contract["withdrawBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"] ([], data, {
        gasLimit,
        gasPrice
      })
      
      console.log('base withdraw',response)
      return response
    }else {
      // estimateGas
      const _gasLimit = await contract["withdrawBase((bytes32,uint256,uint256,address))"].estimateGas(data)
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
      const response = await contract["withdrawBase((bytes32,uint256,uint256,address))"] (data, {
        gasLimit,
        gasPrice
      })
      
      console.log('base withdraw',response)
      return response
    }
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}


