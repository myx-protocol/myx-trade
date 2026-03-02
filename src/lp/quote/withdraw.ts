import { getAccount, getBasePoolContract, getLiquidityRouterContract, getQuotePoolContract } from "@/web3/providers";
import type { BytesLike } from "ethers";
import { parseUnits } from "ethers";
import { OracleUpdatePrice, WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { checkParams } from "@/common/checkParams";
import { previewQuoteAmountOut } from "@/lp/quote/preview";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { MarketPoolState } from "@/api";
import { getPriceData } from "@/common/price";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { ChainId } from "@/config/chain";

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
    if (price !== 0n && !price) {
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
    }
    const data = {
      poolId,
      price: (referencePrice || 0n),
    }
    const request = await quotePoolContract.withdrawableLpAmount(poolId, referencePrice || 0n)
    console.log(`base pool withdrawableLpAmount: ${withdrawableLpAmount}`)
    
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
    
    let _withdrawableLpAmount;
    
    
    if (isNeedPrice) {
      // todo  getprice
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
      _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: referencePrice})
      
    } else {
      amountOut = await previewQuoteAmountOut ({ chainId, poolId, amountIn })
      _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: 0n})
    }
    
    if (_withdrawableLpAmount &&  amountIn > _withdrawableLpAmount) {
      throw new Error(Errors[ErrorCode.Invalid_Chain_ID]);
    }
    
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator (amountOut, slippage),// todo  调合约获取
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


