import { AddTpSLParams, TpSLParams } from "@/lp/pool/type";
import { getLiquidityRouterContract } from "../../web3/providers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { CHAIN_INFO } from "@/config/chains/index";
import { parseUnits } from "ethers";
import { Market } from "@/config/market";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { checkParams } from "@/common/checkParams";


export const addTpSl = async (params:AddTpSLParams) => {
  try {
    const {chainId, poolId, poolType,slippage = 0.01,  tpsl = []} = params;
    await checkParams (params)
    
    if (tpsl.length === 0) {
      throw new Error(Errors[ ErrorCode.Invalid_Params]);
    }
    if (tpsl.filter(item => item.amount && item.triggerPrice && item.triggerType).length === 0) {
      throw new Error(Errors[ ErrorCode.Invalid_Params]);
    }
    
    
    
    const decimals = Market[chainId].lpDecimals
    const tpslParams = tpsl.map(item => {
      const amount = parseUnits(item.amount.toString(), decimals)
      const triggerPrice = parseUnits(item.triggerPrice.toString(), COMMON_PRICE_DECIMALS)
      const minQuoteOut = bigintAmountSlipperCalculator(amount * triggerPrice/ BigInt(10 ** COMMON_PRICE_DECIMALS), slippage)
      return {
        amount,
        triggerPrice,
        triggerType: BigInt(item.triggerType),
        minQuoteOut
      } as TpSLParams
    })
    
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
    
    console.log('add tpSl params:', data)
    
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
    const receipt = await request?.wait()
    console.log(request)
    return receipt;
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
