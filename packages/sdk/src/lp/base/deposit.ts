import { getAccount, getLiquidityRouterContract } from "@/web3/providers.js";
import { type BytesLike, parseUnits } from "ethers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getContractAddressByChainId } from "@/config/address.js";

import { Deposit,type OracleUpdatePrice } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/base/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { MarketPoolState } from "@/api/index.js";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getPriceData } from "@/common/price.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import type { TpSl } from "@/lp/pool/type.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";


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
    
    const addresses = getContractAddressByChainId(chainId);
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
    const price : OracleUpdatePrice[] =[]
    const amountIn = parseUnits (amount.toString (), decimals)
    let value = 0n;
    let amountOut;
    if (isNeedPrice) {
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId,
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
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      recipient: account,
      tpslParams
    }
    
    const  contract = await getLiquidityRouterContract(chainId)
    
    //estimateGas
    const _gasLimit = await contract["depositBase((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(price,data, {value})
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract["depositBase((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](price, data, {
      gasLimit,
      gasPrice,
      value
    })
    
    return result
    
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
