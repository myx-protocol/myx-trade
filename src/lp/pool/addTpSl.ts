import { AddTpSLParams, CreatePoolRequest } from "@/lp/pool/type";
import { getLiquidityRouterContract } from "../../web3/providers";
import { isSupportedChainFn } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";


export const addTpSl = async ({chainId, poolId, poolType, tpslParams = []}:AddTpSLParams) => {
  try {
    if (!isSupportedChainFn(chainId)) {
      throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    }
    
    // const _poolId = await getPoolManagerContract(chainId);
    // if (_poolId) {
    //   throw new Error(Errors[ErrorCode.Invalid_Base]);
    // }
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const data =  {
      poolId: poolId,
      poolType: poolType,
      tpslParams
    }
    
    
    
    const _gasLimit = await contract.addTpsl.estimateGas(data)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    console.log("gasPrice", gasPrice)
    
    const request = await contract.addTpsl(data, {
      gasLimit,
      gasPrice
    })
    console.log("addTpsl request", request);
    // const receipt = await request?.wait()
    // console.log(request)
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
