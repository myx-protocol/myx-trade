import { CreatePoolRequest } from "@/lp/pool/type.js";
import { getPoolManagerContract } from "../../web3/providers.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import {  getMarketPoolId } from "@/lp/pool/get.js";
import { getPublicClient } from "@/web3";

export const createPool = async ({chainId, baseToken, marketId}:CreatePoolRequest) => {
  try {
    // if (!isSupportedChainFn(chainId)) {
    //   throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    // }
    
    if (!baseToken) {
      throw new Error(Errors[ErrorCode.Invalid_TOKEN_ADDRESS]);
    }
    // const _poolId = await getPoolManagerContract(chainId);
    // if (_poolId) {
    //   throw new Error(Errors[ErrorCode.Invalid_Base]);
    // }
    
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getPoolManagerContract(chainId)

    const data =  { marketId, baseToken }

    const _gasLimit = await contract.estimateGas!.deployPool([data])
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const hash = await contract.write!.deployPool([data], {
      gasLimit,
      gasPrice
    })
    const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
    
   
    if (receipt) {
      const poolId = await getMarketPoolId({chainId, baseToken, marketId})
      return poolId
    }
    // console.log(request)
  } catch (error) {
    // console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
