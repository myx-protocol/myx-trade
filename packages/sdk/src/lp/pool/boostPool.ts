import { BoostPoolParams } from "@/lp/pool/type.js";
import { getAccount, getLiquidityRouterContract } from "../../web3/providers.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import sdk, { getPublicClient } from "@/web3";
import { getPoolInfo } from "@/lp/getPoolInfo.ts";
import { formatUnits, parseUnits } from "viem";
import { getContractAddressByChainId } from "@/config/address";


export const boostPool = async (params:BoostPoolParams) => {
  try {
    const {chainId, poolId} = params;
    await checkParams({ chainId })
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const account = await getAccount(chainId);
    const markets = sdk?.Markets?.length ? sdk?.Markets : (await sdk.getMarkets());
    const market = (markets || [])?.find((m) => m.chainId === chainId && m.marketId === pool.marketId);
    if (!market) {
      throw new Error('Invalid Market');
    }
    
    const _amount = parseUnits(market.boostFeeUsd.toString(), pool.quoteDecimals)
    
    if (!_amount) {
      throw new Error('Invalid Market');
    }
    await checkParams({
      tokenAddress: pool.quoteToken,
      contractAddress: getContractAddressByChainId(chainId).ORACLE_RESERVE,
      decimals: pool.quoteDecimals,
      account,
      chainId,
      amount: Number(formatUnits(_amount, pool.quoteDecimals)),
    })
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const _gasLimit = await contract.estimateGas!.boostPool([{ poolId } ])
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    // console.log("gasLimit", _gasLimit, gasLimit);
    
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    // console.log("gasPrice", gasPrice)
    
    const hash = await contract.write!.boostPool([{ poolId }], {
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
