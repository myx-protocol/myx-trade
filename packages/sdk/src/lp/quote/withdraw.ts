import { getAccount, getLiquidityRouterContract, getQuotePoolContract } from "@/web3/providers.js";
import type { BytesLike } from "ethers";
import { parseUnits } from "ethers";
import { OracleUpdatePrice, WithdrawParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { checkParams } from "@/common/checkParams.js";
import { previewQuoteAmountOut } from "@/lp/quote/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { MarketPoolState } from "@/api/index.js";
import { getPriceData } from "@/common/price.js";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { ChainId } from "@/config/chain.js";

export const withdrawableLpAmount = async (
  params: {
    chainId: ChainId;
    poolId: string;
    price?: bigint;
  }
) => {
  try {
    const {chainId, poolId, price} = params;
    let referencePrice = price
    const quotePoolContract = await getQuotePoolContract(chainId);
    if (typeof price === 'undefined' || price === null) {
      try {
        const priceData = await  getPriceData(chainId, poolId)
        referencePrice = parseUnits(priceData?.price || '0', COMMON_PRICE_DECIMALS)
      } catch (error) {
        referencePrice = parseUnits( '0', COMMON_PRICE_DECIMALS)
      }
    }
    const data = {
      poolId,
      price: (referencePrice || 0n),
    }
    const request = await quotePoolContract.withdrawableLpAmount(poolId, referencePrice || 0n)
    // console.log(`quote pool withdrawableLpAmount: ${request}`)
    
    return request
    
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}

export const withdraw = async (params: WithdrawParams) => {
  try {
    
    const { chainId, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo (chainId, poolId)
    const lpAddress = pool?.quotePoolToken
    
    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = COMMON_LP_AMOUNT_DECIMALS;
    
    await checkParams ({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    
    const amountIn = parseUnits (amount.toString (), decimals)
    
    const isNeedPrice = !(Number (pool?.state) === MarketPoolState.Cook || Number (pool?.state) === MarketPoolState.Primed)
    
    const price: OracleUpdatePrice[] = []
    
    let value = 0n;
    
    let amountOut;
    
    // let _withdrawableLpAmount;
    
    if (isNeedPrice) {
      const priceData = await getPriceData (chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits (priceData.price, COMMON_PRICE_DECIMALS)
      price.push ({
        poolId,
        oracleUpdateData: priceData.vaa,
        publishTime: priceData.publishTime,
        oracleType: priceData.oracleType,
      })
      amountOut = await previewQuoteAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
      // _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: referencePrice})
      
    } else {
      amountOut = await previewQuoteAmountOut ({ chainId, poolId, amountIn })
      // _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: 0n})
    }
    
   /* if (_withdrawableLpAmount &&  amountIn > _withdrawableLpAmount) {
      throw new Error(Errors[ErrorCode.Invalid_Amount_Withdrawable_Lp_Amount]);
    }*/
    
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator (amountOut, slippage),
      recipient: account,
    }
    
    // console.log ("withdraw", data);
    
    const contract = await getLiquidityRouterContract (chainId)
    
    const _gasLimit = await contract["withdrawQuote((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address))"].estimateGas (price, data, { value })
    const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
    const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId);
    const request = await contract["withdrawQuote((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address))"](price, data, {
      gasLimit,
      gasPrice,
      value,
    })
    
    // console.log ("withdraw quote with price", request)
    const receipt = await request?.wait()
    
    // console.log ("withdraw quote receipt", receipt)
    return receipt
    
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


