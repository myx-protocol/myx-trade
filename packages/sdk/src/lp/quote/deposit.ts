import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import {  type BytesLike, parseUnits } from "ethers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";
import Address from "@/config/address";
import { Deposit } from "@/lp/type";
import { checkParams } from "@/common/checkParams";
import { previewLpAmountOut } from "@/lp/quote/preview";
import { MarketPoolState, OracleType } from "@/api";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { BigNumberish, Typed } from "ethers/lib.esm";
import { getPriceData } from "@/common/price";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import type { TpSl } from "@/lp/pool";
import { getTpSlParams } from "@/common/getTpSlParams";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";


export const deposit = async (params: Deposit) => {
  try {
    const {poolId, chainId, amount, slippage = 0.01, tpsl = []} = params;
    await checkParams(params)
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = pool.quoteToken;
    const decimals = pool?.quoteDecimals;
    
    
   
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
    
    const price : Typed | { poolId: BytesLike; referencePrice: BigNumberish; oracleUpdateData: BytesLike; publishTime: BigNumberish; oracleType: OracleType }[] =[]
    
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
        oracleType: priceData.oracleType,
      })
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
    } else {
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn})
    }
    
    const _tpsl = tpsl.map((item) => {
      return {
        amount,
        triggerPrice: item.triggerPrice,
        triggerType: item.triggerType,
      } as TpSl
    })
    
    const tpslParams = getTpSlParams(slippage, _tpsl, decimals, decimals);
   
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams
    }
    
    console.log("deposit params: price, data, value :",price, data, value);
    
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract["depositQuote((bytes32,uint8,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(price,data, { value })
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract["depositQuote((bytes32,uint8,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](price,data, {
      gasLimit,
      gasPrice,
      value
    })
    
    console.log("deposit", result)
    return result
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
