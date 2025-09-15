import { CreatePoolRequest } from "@/lp/pool/type";
import { getPoolManagerContract } from "../../web3/providers";
import { ChainId, isSupportedChainFn } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { Market } from "@/config/market";
import { getPools } from "@/api";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains";
import { deposit } from "@/lp/quote/deposit";
import {  getMarketPoolId } from "@/lp/pool/get";

const chainId = ChainId.ARB_TESTNET;
const marketId = Market[chainId].marketId;

export const createPool = async ({chainId, baseToken}:CreatePoolRequest) => {
  try {
    if (!isSupportedChainFn(chainId)) {
      throw new Error(Errors[ ErrorCode.Invalid_Chain_ID]);
    }
    
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
    
    const _gasLimit = await contract.deployPool.estimateGas(data)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    console.log("gasPrice", gasPrice)
    
    const request = await contract.deployPool(data, {
      gasLimit,
      gasPrice
    })
    const receipt = await request?.wait()
    if (receipt?.hash) {
      const poolId = await getMarketPoolId({chainId, baseToken})
      if(poolId) {
        // deposite $26000
        await deposit({
          poolId,
          amount: Number(Market[chainId].poolPrimeThreshold),
          chainId,
          slippage: 0.01
        })
      }
    }
    // console.log(request)
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
