import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import {parseUnits } from "ethers";
import { WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { Market } from "@/config/market";
import { checkParams } from "@/common/checkParams";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { previewBaseAmountOut, previewLpAmountOut } from "@/lp/base/preview";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { MarketPoolState } from "@/api";
import { BigNumberish, type BytesLike, Typed } from "ethers/lib.esm";
import { getPriceData } from "@/common/price";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";

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
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    
    const price : Typed | { poolId: BytesLike; referencePrice: BigNumberish; oracleUpdateData: BytesLike; publishTime: BigNumberish; }[] =[]
    let value = 0n;
    let amountOut;
    if (isNeedPrice) {
      // todo  getprice
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId,
        referencePrice ,
        oracleUpdateData: priceData.vaa,
        publishTime: priceData.publishTime,
      })
      amountOut = await previewBaseAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
    } else {
      amountOut = await previewBaseAmountOut ({ chainId, poolId, amountIn})
    }
    
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage) ,
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    
      // estimateGas
      const _gasLimit = await contract["withdrawBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"].estimateGas(price, data, { value })
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
      const response = await contract["withdrawBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address))"] (price, data, {
        gasLimit,
        gasPrice,
        value,
      })
      
      console.log('base withdraw',response)
      return response
    
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}


