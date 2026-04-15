import { getAccount, getLiquidityRouterContract } from "@/web3/providers.js";
import { parseUnits } from "viem";
import { sdkError } from "@/logger";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getContractAddressByChainId } from "@/config/address/index.js";

import { Deposit,type OracleUpdatePrice } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/base/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { type Address, MarketPoolState } from "@/api/index.js";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getPriceData } from "@/common/price.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import type { TpSl } from "@/lp/pool/type.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { getPublicClient } from "@/web3";
import { isNeedPrice } from "@/utils/isNeedPrice.ts";


export const deposit = async (params: Deposit) => {
  try {
    const { poolId, chainId, amount, slippage = 0.01, tpsl = [] } = params;
    await checkParams (params)
    
    const pool = await getPoolInfo (chainId,poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const decimals = pool?.baseDecimals
    const quoteDecimals = pool?.quoteDecimals
    const tokenAddress = pool?.baseToken
    
    
    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = getContractAddressByChainId(chainId);
    const contractAddress = addresses.BASE_POOL;
    
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const _isNeedPrice = isNeedPrice(pool?.state)
    const price : OracleUpdatePrice[] =[]
    const amountIn = parseUnits (amount.toString (), decimals)
    let value = 0n;
    let amountOut;
    if (_isNeedPrice) {
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId: poolId as Address,
        oracleType: priceData.oracleType,
        publishTime: BigInt(priceData.publishTime),
        oracleUpdateData: priceData.vaa as Address,
      })
      
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
    } else {
      amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn})
    }
    
    const _tpsl = tpsl.map((item) => {
      return {
        amount,
        triggerPrice: item.triggerPrice,
        triggerType: item.triggerType,
      } as TpSl
    })
    const tpslParams = getTpSlParams(slippage, _tpsl, decimals, quoteDecimals);
    
    const data = {
      poolId: poolId as unknown as import("viem").Hex,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      recipient: account,
      tpslParams
    }
    
    const  contract = await getLiquidityRouterContract(chainId)

    // estimate gas (viem style, args array)
    const _gasLimit = await contract.estimateGas!.depositBase(
      [price, data],
      { value },
    )
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const hash = await contract.write!.depositBase(
      [price, data],
      {
        gasLimit,
        gasPrice,
        value,
      },
    )
    
    const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
    
    return receipt
    
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
