import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import type { AddressLike } from "ethers";
import { parseEther, parseUnits, hexlify } from "ethers";
import { WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains";
import { Market } from "@/config/market";
import { checkParams } from "@/common/checkParams";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { previewBaseAmountOut } from "@/lp/base/preview";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";

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
    
    // estimateGas
    const _gasLimit = await contract.withdrawBase.estimateGas(data)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract.withdrawBase (data, {
      gasLimit,
      gasPrice
    })
    
    console.log('base withdraw',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}


