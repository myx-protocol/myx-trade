import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { checkParams } from "@/common/checkParams";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { parseUnits } from "ethers";
import {  COMMON_PRICE_DECIMALS } from "@/config/decimals";
import {  getPricesData } from "@/common/price";
import { getErrorTextFormError } from "@/config/error";

export const claimBasePoolRebate = async (
  params: ClaimParams
) => {
  try {
    const { chainId, poolId} = params;
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
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
        poolId: poolId,
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
    console.log('base claim', data)
    const contract = await getLiquidityRouterContract(chainId)
    
    // estimateGas
    const _gasLimit = await contract["claimBasePoolRebate((bytes32,uint256,bytes,uint64)[],bytes32,address)"].estimateGas(prices, poolId, account, {
      value: values[0]
    })
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const response = await contract["claimBasePoolRebate((bytes32,uint256,bytes,uint64)[],bytes32,address)"] (prices, poolId, account, {
      gasLimit,
      gasPrice,
      value: values[0],
    })
    
    console.log('base claim',response)
    return response
    
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


export const claimBasePoolRebates = async (
  params: ClaimRebatesParams
) => {
  try {
    const { chainId, poolIds } = params;
    if (poolIds.length === 0) return;
    
    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    await checkParams ({
      account,
      chainId,
    })
    const priceData = await getPricesData (chainId, poolIds)
    if (!priceData) return
    
    const prices = priceData.map ((item) => {
      return {
        poolId: item.poolId,
        referencePrice: parseUnits (item?.price ?? '0', COMMON_PRICE_DECIMALS),
        oracleUpdateData: item?.vaa ?? '0',
        publishTime: item.publishTime
      }
    })
    
    const values = priceData.map ((item) => item.value)
    const value = values.reduce ((prev, curr) => curr + prev, 0n)
    
    const data = {
      prices,
      poolIds,
      value,
      recipient: account
    }
    
    console.log ('base claim pool rebates', data)
    const contract = await getLiquidityRouterContract (chainId)
    
    // estimateGas
    const _gasLimit = await contract["claimBasePoolRebates((bytes32,uint256,bytes,uint64)[],bytes32[],address)"].estimateGas (prices, poolIds, account, {
      value
    })
    const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
    const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId)
    const response = await contract["claimBasePoolRebates((bytes32,uint256,bytes,uint64)[],bytes32[],address)"] (prices, poolIds, account, {
      gasLimit,
      gasPrice,
      value
    })
    
    console.log ('base claim rebates', response)
    return response
    
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
