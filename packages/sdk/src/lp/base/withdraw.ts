import { getAccount, getBasePoolContract, getLiquidityRouterContract } from "@/web3/providers.js";
import { parseUnits } from "viem";
import { WithdrawParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.js";
import { getPriceData } from "@/common/price.js";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { ChainId } from "@/config/chain.js";
import { getPublicClient } from "@/web3";
import { getWithdrawData } from "@/common/withdrawData.ts";
import { PoolType } from "@/lp/pool";
import { MarketPoolState } from "@/api";

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
    const basePoolContract = await getBasePoolContract(chainId);
    if (typeof price === 'undefined' || price === null) {
      try {
        const priceData = await  getPriceData(chainId, poolId)
        referencePrice = parseUnits(priceData?.price || '0', COMMON_PRICE_DECIMALS)
      } catch (error) {
        referencePrice = parseUnits( '0', COMMON_PRICE_DECIMALS)
      }
     
    }
   
    const request = await basePoolContract.read.withdrawableLpAmount([poolId, referencePrice || 0n])
    // console.log(`base pool withdrawableLpAmount: ${request}`)
    
    return request
    
  } catch (error) {
    // console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}

export const withdraw = async (
  params: WithdrawParams
) => {
  try {
    const { chainId, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo (chainId, poolId)
    const lpAddress = pool?.basePoolToken
    
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
    
    const amountIn = parseUnits (amount.toString (), decimals);
    
    const {price, data, value} = await getWithdrawData({poolId,chainId,account,amountIn, slippage, poolType: PoolType.Base, state: pool?.state  as MarketPoolState})
    
    const contract = await getLiquidityRouterContract (chainId)
    
    // estimate gas (viem style, args array)
    const _gasLimit = await contract.estimateGas!.withdrawBase (
      [price, data],
      { value },
    )
    const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
    const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId)
    const hash = await contract.write!.withdrawBase (
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
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}



