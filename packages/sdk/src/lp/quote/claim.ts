import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { checkParams } from "@/common/checkParams";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { parseUnits } from "ethers";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getPricesData } from "@/common/price";

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
        referencePrice: parseUnits(item?.price ?? '0', COMMON_PRICE_DECIMALS),
        oracleUpdateData: item?.vaa ?? '0',
        publishTime: item.publishTime
      }
    })
    
    const data = {
      prices,
      values,
      poolId,
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    console.log("quote claim params", data)
    
    // estimateGas
    // const _gasLimit = await contract["claimQuotePoolRebate((bytes32,uint256,bytes,uint64)[],bytes32,address)"]
    // .estimateGas(prices,poolId, account, {
    //   value: values[0]
    // })
    // const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract["claimQuotePoolRebate((bytes32,uint256,bytes,uint64)[],bytes32,address)"] ( prices,poolId, account, {
      // gasLimit,
      // gasPrice,
      value: values[0]
    })
    
    console.log('quote claim',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw error;
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
        referencePrice: parseUnits(item?.price ?? '0', COMMON_PRICE_DECIMALS),
        oracleUpdateData: item?.vaa ?? '0',
        publishTime: item.publishTime
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
    
    console.log("quote claim Rebates params", data)
    
    const contract = await getLiquidityRouterContract(chainId)
    
    // estimateGas
    const _gasLimit = await contract["claimQuotePoolRebates((bytes32,uint256,bytes,uint64)[],bytes32[],address)"].estimateGas(prices, poolIds, account, {
      value
    })
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract["claimQuotePoolRebates((bytes32,uint256,bytes,uint64)[],bytes32[],address)"] (prices, poolIds, account, {
      gasLimit,
      gasPrice,
      value
    })
    
    console.log('quote claim rebates',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}
