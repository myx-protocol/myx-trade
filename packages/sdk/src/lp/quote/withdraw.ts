import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import type { BytesLike } from "ethers";
import { parseUnits } from "ethers";
import { WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { Market } from "@/config/market";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { checkParams } from "@/common/checkParams";
import { previewQuoteAmountOut } from "@/lp/quote/preview";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { MarketPoolState } from "@/api";


export const withdraw = async (params: WithdrawParams) => {
  try {
    
    const { chainId, poolId, amount,  slippage = 0.01} = params;
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
    
    
    const amountIn = parseUnits(amount.toString(), decimals)
    
    const amountOut = await previewQuoteAmountOut({chainId, poolId, amountIn})
    // 拿价格
    // 估算AmountOut
    // * 1 - 滑点
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
    }
    
    console.log("withdraw", data);
    
    const contract = await getLiquidityRouterContract(chainId)
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    if (isNeedPrice) {
      const _gasLimit = await contract["withdrawQuote((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"].estimateGas ([], data)
      const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
      const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId);
      const request = await contract["withdrawQuote((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"]([], data, {
        gasLimit,
        gasPrice
      })
      
      console.log ("withdraw quote with price", request)
      return request
    } else {
      // estimateGas
      const _gasLimit = await contract["withdrawQuote((bytes32,uint256,uint256,address))"].estimateGas (data)
      const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
      const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId);
      const request = await contract["withdrawQuote((bytes32,uint256,uint256,address))"] (data, {
        gasLimit,
        gasPrice
      })
      
      console.log ("withdraw quote", request)
      return request
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}


