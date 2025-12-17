import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { BigNumberish, type BytesLike, parseUnits, Typed } from "ethers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";
import Address from "@/config/address";

import { Deposit } from "@/lp/type";
import { checkParams } from "@/common/checkParams";
import { previewLpAmountOut } from "@/lp/base/preview";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { MarketPoolState, OracleType } from "@/api";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getPriceData } from "@/common/price";
import { getTpSlParams } from "@/common/getTpSlParams";
import type { TpSl } from "@/lp/pool";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";


export const deposit = async (params: Deposit) => {
  try {
    const { poolId, chainId, amount, slippage = 0.01, tpsl = [] } = params;
    await checkParams (params)
    
    const pool = await getPoolInfo (chainId,poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const decimals = pool?.baseDecimals
    const quoteDecimals = pool?.quoteDecimals
    const tokenAddress = pool?.baseToken
    
    
    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.BASE_POOL;
    
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    const price : Typed | { poolId: BytesLike; referencePrice: BigNumberish; oracleUpdateData: BytesLike; publishTime: BigNumberish; oracleType: OracleType;}[] =[]
    const amountIn = parseUnits (amount.toString (), decimals)
    let value = 0n;
    let amountOut;
    if (isNeedPrice) {
      // todo  getprice
      // todo cici
      // @ts-ignore
      const priceData = await  getPriceData(chainId, poolId, true)
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
    const tpslParams = getTpSlParams(slippage, _tpsl, decimals, quoteDecimals);
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams
    }
    
    // console.log("deposit base", price, data, value);
    const  contract = await getLiquidityRouterContract(chainId)
    
    
    
    //estimateGas
    const _gasLimit = await contract["depositBase((bytes32,uint8,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(price,data, {value})
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract["depositBase((bytes32,uint8,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](price, data, {
      gasLimit,
      gasPrice,
      value
    })
    
    // console.log("deposit", result)
    return result
    
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
