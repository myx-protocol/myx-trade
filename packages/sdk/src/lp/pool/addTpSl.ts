import { AddTpSLParams } from "@/lp/pool/type.js";
import { getLiquidityRouterContract } from "../../web3/providers.js";
import { sdkError } from "@/logger";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { COMMON_LP_AMOUNT_DECIMALS } from "@/config/decimals.js";
import { getPublicClient } from "@/web3";


export const addTpSl = async (params:AddTpSLParams) => {
  try {
    const {chainId, poolId, poolType,slippage = 0.01,  tpsl = []} = params;
    await checkParams (params)
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    
    const decimals = COMMON_LP_AMOUNT_DECIMALS
    const quoteDecimals = pool.quoteDecimals
    
    const tpslParams = getTpSlParams(slippage, tpsl, decimals, quoteDecimals);
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const data =  {
      poolId,
      poolType: BigInt(poolType),
      tpslParams
    }
    
    // console.log('add tpSl params:', data)
    
    const _gasLimit = await contract.estimateGas!.addTpsl([data])
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const hash = await contract.write!.addTpsl([data], {
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
