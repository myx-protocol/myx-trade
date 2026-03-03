import { RewardsParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { getBasePoolContract } from "@/web3/providers";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { getOraclePrice } from "@/api";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getErrorTextFormError } from "@/config/error";

export const getRewards = async (params: RewardsParams) => {
  try {
    const {chainId, account, poolId} = params;
    if (!chainId || !account || !poolId) return
    const chainInfo =  CHAIN_INFO[chainId];
    const lpAmountIn = 0n
    
    // todo ws price
    const priceResponse = await getOraclePrice(chainId, [poolId]);
    const _price = priceResponse.data?.[0]?.price || '0';
    
    const price = parseUnits(_price, COMMON_PRICE_DECIMALS)
    
    // console.log("pendingUserRebates base data:", [poolId, lpAmountIn,account, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    const _gasLimit = await basePoolContract.pendingUserRebates.estimateGas(poolId, account, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await basePoolContract.pendingUserRebates(poolId,account, price, {
      gasLimit,
      gasPrice
    })
    
    console.log("pendingUserRebates base result:", {
      rebates: request?.rebates,
      genesisRebates: request?.genesisRebates,
    });
    
    return {
      rebates: request?.rebates,
      genesisRebates: request?.genesisRebates,
    }
  
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
