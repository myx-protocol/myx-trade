import { getAccount, getLiquidityRouterContract } from "@/web3/providers.js";
import type { Hex } from "viem";
import { parseUnits } from "viem";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { Deposit, type OracleUpdatePrice } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/quote/preview.js";
import { MarketPoolState, OracleType } from "@/api/index.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { getPriceData } from "@/common/price.js";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import type { TpSl } from "@/lp/pool/index.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { getPublicClient } from "@/web3";
import { sdkError } from "@/logger";


export const deposit = async (params: Deposit) => {
  try {
    const {poolId, chainId, amount, slippage = 0.01, tpsl = []} = params;
    await checkParams(params)
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params])
    }
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = getContractAddressByChainId(chainId);
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = pool.quoteToken;
    const decimals = pool?.quoteDecimals;
   
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits(amount.toString(), decimals)
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    
    const price : OracleUpdatePrice[] =[]
    
    let value = 0n
    let amountOut;
    
    if (isNeedPrice) {
      // todo  getprice
      const priceData = await getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId: poolId as `0x${string}`,
        oracleUpdateData: priceData.vaa as `0x${string}`,
        publishTime: BigInt(priceData.publishTime),
        oracleType: priceData.oracleType,
      });
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
    
    const tpslParams = getTpSlParams(slippage, _tpsl, decimals, decimals);
   
    const data = {
      poolId: poolId as unknown as import("viem").Hex,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      recipient: account,
      tpslParams
    }
    
    // console.log("deposit params: price, data, value :",price, data, value);
    
    const contract = await getLiquidityRouterContract(chainId)
    // estimate gas (viem style, args array)
    const _gasLimit =  await contract.estimateGas!.depositQuote(
      [price, data],
      { value },
    )
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const hash = await contract.write!.depositQuote(
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
