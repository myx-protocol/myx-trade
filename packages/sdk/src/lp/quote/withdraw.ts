import { getAccount, getLiquidityRouterContract, getQuotePoolContract } from "@/web3/providers.js";
import { parseUnits } from "viem";
import { WithdrawParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { checkParams } from "@/common/checkParams.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { MarketPoolState } from "@/api/index.js";
import { getPriceData } from "@/common/price.js";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { ChainId } from "@/config/chain.js";
import { sdkError } from "@/logger";
import { getPublicClient } from "@/web3";
import { getWithdrawData } from "@/common/withdrawData.ts";
import { PoolType } from "@/lp/pool";

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
   
    const request = await quotePoolContract.read.withdrawableLpAmount([poolId, referencePrice || 0n])
    return request
    
  } catch (error) {
    sdkError(error);
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
    
    const {price, data, value} = await getWithdrawData({
      poolId,
      chainId,
      account,
      amountIn,
      slippage,
      poolType: PoolType.Quote,
      state: pool?.state as MarketPoolState
    })
    
    const contract = await getLiquidityRouterContract (chainId)

    const _gasLimit = await contract.estimateGas!.withdrawQuote(
      [price, data],
      { value },
    )
    const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
    const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId);
    const hash = await contract.write!.withdrawQuote(
      [price, data],
      {
        gasLimit,
        gasPrice,
        value,
      },
    )
    
    const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
    
    return receipt
    
  } catch (error) {
    sdkError(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


