import { getErrorTextFormError } from "@/config/error";
import { getMarketManageContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import { checkParams } from "@/common/checkParams";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common";
import { CHAIN_INFO } from "@/config/chains/index";

export const getMarket = async (chainId: ChainId, marketId: string)  => {
  try {
    await checkParams({chainId})
    if (!marketId) return
  
    const contract = await getMarketManageContract(chainId)
    const chainInfo = CHAIN_INFO[chainId];
    const _gasLimit = await contract.getMarket.estimateGas(marketId)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    console.log("gasPrice", gasPrice)
    
    const request = await contract.getMarket(marketId)
    console.log("MarketManage.getMarket request", request);
    
    /*const {
      marketId,
      quoteToken,
      baseReserveRatio,
      quoteReserveRatio,
      oracleFeeUsd,
      oracleRefundFeeUsd,
      poolPrimeThreshol
    } = request*/
    console.log(request)
    return request;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
