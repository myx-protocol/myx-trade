import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import {  type BytesLike, MaxUint256, parseUnits } from "ethers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";
import { Market } from "@/config/market";
import Address from "@/config/address";
import { Deposit } from "@/lp/type";
import { checkParams } from "@/common/checkParams";
import { previewLpAmountOut } from "@/lp/quote/preview";
import { MarketPoolState } from "@/api";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { BigNumberish, Typed } from "ethers/lib.esm";
import { getPriceData } from "@/common/price";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";


export const deposit = async (params: Deposit) => {
  try {
    const {poolId, chainId, amount, slippage = 0.01} = params;
    await checkParams(params)
    const pool = await getPoolInfo(poolId);
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = Market[chainId].quoteToken;
    const decimals = Market[chainId].decimals;
    
   
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits(amount.toString(), decimals)
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    
    const price : Typed | { poolId: BytesLike; referencePrice: BigNumberish; oracleUpdateData: BytesLike; publishTime: BigNumberish; }[] =[]
    
    let value = 0n
    let amountOut;
    
    if (isNeedPrice) {
      // todo  getprice
      const priceData = await getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId,
        referencePrice ,
        oracleUpdateData: priceData.vaa,
        publishTime: priceData.publishTime,
      })
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
    } else {
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn})
    }
   
    console.log(amountOut)
    const tpslParams = []
   
   console.log((amount * (1- slippage)))
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams: []
    }
    
    console.log("deposit params: price, data, value :",price, data, value);
    
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract["depositQuote((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(price,data, { value })
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract["depositQuote((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](price,data, {
      gasLimit,
      gasPrice,
      value
    })
    
    console.log("deposit", result)
    return result
  } catch (e) {
    console.error(e)
    throw e
  }
}
