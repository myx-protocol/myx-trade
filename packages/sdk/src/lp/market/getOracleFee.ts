import { getErrorTextFormError } from "@/config/error";
import { getMarketManageContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import { checkParams } from "@/common/checkParams";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common";
import { CHAIN_INFO } from "@/config/chains/index";

export const getOracleFee = async (chainId: ChainId, marketId: string)  => {
  try {
    await checkParams({chainId})
    if (!marketId) return
    
    const contract = await getMarketManageContract(chainId)
    const chainInfo = CHAIN_INFO[chainId];
    const _gasLimit = await contract.getOracleFee.estimateGas(marketId)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    console.log("gasPrice", gasPrice)
    
    const request = await contract.getOracleFee(marketId)
    console.log("MarketManage.getOracleFee request", request);
    
    console.log(request)
    return request;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
