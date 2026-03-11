import { CancelTpSLParams } from "@/lp/pool/type";
import { getLiquidityRouterContract } from "../../web3/providers.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";
import { checkParams } from "@/common/checkParams";


export const cancelTpSl = async (params:CancelTpSLParams) => {
  try {
    const {chainId, orderId} = params;
    await checkParams (params)
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const _gasLimit = await contract.cancelTpsl.estimateGas(orderId)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const request = await contract.cancelTpsl(orderId, {
      gasLimit,
      gasPrice
    })
    // console.log("cancelTpSl request", request);
    const receipt = await request?.wait()
    // console.log(request)
    return receipt;
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
