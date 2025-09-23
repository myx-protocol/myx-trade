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
import { getTpSlParams } from "@/common/getTpSlParams";


export const addTpSl = async (params:AddTpSLParams) => {
  try {
    const {chainId, poolId, poolType,slippage = 0.01,  tpsl = []} = params;
    await checkParams (params)
    
    
    
    
    
    const decimals = Market[chainId].lpDecimals
    const tpslParams = getTpSlParams(slippage, tpsl, decimals);
    
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getLiquidityRouterContract(chainId)
    
    const data =  {
      poolId,
      poolType: BigInt(poolType),
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
