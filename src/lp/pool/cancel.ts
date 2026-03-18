import { CancelTpSLParams } from "@/lp/pool/type.js";
import { getLiquidityRouterContract } from "../../web3/providers.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { getErrorTextFormError } from "@/config/error.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";


export const cancelTpSl = async (params:CancelTpSLParams) => {
  try {
    const {chainId, orderId} = params;
    await checkParams (params)
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)

    const _gasLimit = await contract.estimateGas!.cancelTpsl([orderId])
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const request = await contract.write!.cancelTpsl([orderId], {
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
