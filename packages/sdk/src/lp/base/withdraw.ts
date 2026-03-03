import { getAccount, getBasePoolContract, getLiquidityRouterContract } from "@/web3/providers";
import {parseUnits } from "ethers";
import { OracleUpdatePrice, WithdrawParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { checkParams } from "@/common/checkParams";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { previewBaseAmountOut } from "@/lp/base/preview";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { MarketPoolState } from "@/api";
import { getPriceData } from "@/common/price";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error";
import { ChainId } from "@/config/chain";

export const withdrawableLpAmount = async (
  params: {
    chainId: ChainId;
    poolId: string;
    price?: bigint;
  }
) => {
  try {
    const {chainId, poolId, price} = params;
    let referencePrice = price
    const basePoolContract = await getBasePoolContract(chainId);
    if (price !== 0n && !price) {
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
    }
    const data = {
      poolId,
      price: (referencePrice || 0n),
    }
    const request = await basePoolContract.withdrawableLpAmount(poolId, referencePrice || 0n)
    console.log(`base pool withdrawableLpAmount: ${withdrawableLpAmount}`)
    
    return request
    
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}

export const withdraw = async (
  params: WithdrawParams
) => {
  try {
    const { chainId, poolId, amount, slippage = 0.01} = params;
    const pool = await getPoolInfo(chainId,poolId)
    const lpAddress = pool?.basePoolToken
    
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const decimals = COMMON_LP_AMOUNT_DECIMALS;
    
    await checkParams ({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits(amount.toString(), decimals);
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    
    const price : OracleUpdatePrice[] =[]
    let value = 0n;
    let amountOut;
    let _withdrawableLpAmount;
    if (isNeedPrice) {
      // todo  getprice
      const priceData = await  getPriceData(chainId, poolId)
      if (!priceData) return
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS)
      price.push({
        poolId,
        oracleUpdateData: priceData.vaa,
        publishTime: priceData.publishTime,
        oracleType: priceData.oracleType,
      })
      amountOut = await previewBaseAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
      value = priceData.value
      _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: referencePrice})
    } else {
      amountOut = await previewBaseAmountOut ({ chainId, poolId, amountIn})
      _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: 0n})
    }
    
    if (_withdrawableLpAmount &&  amountIn > _withdrawableLpAmount) {
      throw new Error(Errors[ErrorCode.Invalid_Chain_ID]);
    }
    
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage) ,
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    
      // estimateGas
      const _gasLimit = await contract["withdrawBase((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address))"].estimateGas(price, data, { value })
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
      const response = await contract["withdrawBase((bytes32,uint8,uint64,bytes)[],(bytes32,uint256,uint256,address))"] (price, data, {
        gasLimit,
        gasPrice,
        value,
      })
    
    const receipt = await response?.wait()
    // console.log('base withdraw',response)
    return receipt
    
    
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}



