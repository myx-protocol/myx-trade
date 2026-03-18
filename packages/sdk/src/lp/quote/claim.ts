import { getAccount, getLiquidityRouterContract } from "@/web3/providers.js";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { COMMON_LP_AMOUNT_DECIMALS } from "@/config/decimals.js";
import { getPricesData } from "@/common/price.js";
import { getErrorTextFormError } from "@/config/error.js";

export const claimQuotePoolRebate = async (
  params: ClaimParams
) => {
  try {
    const { chainId, poolId} = params;
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = COMMON_LP_AMOUNT_DECIMALS;
    
    await checkParams ({
      account,
      chainId,
    })
    
    const priceResponse = await getPricesData(chainId, [poolId]);
    if (!priceResponse) return
    
    const values = priceResponse.map((item) => {
      return item.value
    })
    
    const prices = priceResponse.map((item) => {
      return {
        poolId: item.poolId,
        oracleUpdateData: item?.vaa ?? '0',
        publishTime: item.publishTime,
        oracleType: item.oracleType,
      }
    })
    
    const data = {
      prices,
      values,
      poolId,
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    // console.log("quote claim params", data)

    // estimate gas (viem style, args array)
    const _gasLimit = await contract.estimateGas!.claimQuotePoolRebate(
      [prices, poolId, account],
      { value: values[0] },
    )
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract.write!.claimQuotePoolRebate(
      [prices, poolId, account],
      {
        gasLimit,
        gasPrice,
        value: values[0],
      },
    )
    
    // console.log('quote claim',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}



export const claimQuotePoolRebates = async (
  params: ClaimRebatesParams
) => {
  try {
    const { chainId, poolIds} = params;
    if(poolIds.length === 0) return;
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = COMMON_LP_AMOUNT_DECIMALS;
    
    await checkParams ({
      account,
      chainId,
    })
    const priceResponse = await getPricesData(chainId, poolIds);
    if (!priceResponse) return
    const prices = priceResponse.map((item) => {
      return {
        poolId: item.poolId,
        oracleUpdateData: item?.vaa ?? '0',
        publishTime: item.publishTime,
        oracleType: item.oracleType,
      }
    })
    const values = priceResponse.map((item) => item.value)
    const value = values.reduce((prev, curr) => curr + prev, 0n)
    
    const data = {
      prices,
      value,
      poolIds,
      recipient: account
    }
    
    // console.log("quote claim Rebates params", data)
    
    const contract = await getLiquidityRouterContract(chainId)

    // estimate gas (viem style, args array)
    const _gasLimit = await contract.estimateGas!.claimQuotePoolRebates(
      [prices, poolIds, account],
      { value },
    )
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract.write!.claimQuotePoolRebates(
      [prices, poolIds, account],
      {
        gasLimit,
        gasPrice,
        value,
      },
    )
    
    // console.log('quote claim rebates',response)
    return response
    
  } catch (error) {
    console.error(error);
        throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
