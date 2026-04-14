import { BoostPoolParams } from "@/lp/pool/type.js";
import { getLiquidityRouterContract } from "../../web3/providers.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import { getPublicClient } from "@/web3";


export const unBoostPool = async (params:BoostPoolParams) => {
  try {
    const {chainId, poolId} = params;
    await checkParams({ chainId })
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const _gasLimit = await contract.estimateGas!.unboostPool([{ poolId } ])
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const hash = await contract.write!.unboostPool([{ poolId }], {
      gasLimit,
      gasPrice
    })
    
    const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
    
    return receipt
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
