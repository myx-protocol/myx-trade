import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { BigNumberish, type BytesLike, parseUnits, Typed } from "ethers";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";
import Address from "@/config/address";

import { Deposit } from "@/lp/type";
import { checkParams } from "@/common/checkParams";
import { previewLpAmountOut } from "@/lp/base/preview";
import { getPoolInfo } from "@/lp/getPoolInfo";
import { MarketPoolState } from "@/api";


export const deposit = async (params: Deposit) => {
  try {
    const { poolId, chainId, amount, slippage = 0.01 } = params;
    await checkParams (params)
    
    const pool = await getPoolInfo (poolId);
    const decimals = pool?.baseDecimals
    const tokenAddress = pool?.baseToken
    
    
    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.BASE_POOL;
    
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits (amount.toString (), decimals)
    const amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn })
    
    const price: Typed | { poolId: BytesLike; referencePrice: BigNumberish; oracleUpdateData: BytesLike; publishTime: BigNumberish; }[] = []
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams: []
    }
    
    console.log("deposit base", data);
    const  contract = await getLiquidityRouterContract(chainId)
    
    const isNeedPrice = !(Number(pool?.state) === MarketPoolState.Cook || Number(pool?.state) === MarketPoolState.Primed)
    
    if (isNeedPrice) {
      //estimateGas
      const _gasLimit = await contract["depositBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(price,data)
      
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
      const result = await contract["depositBase((bytes32,uint256,bytes,uint64)[],(bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](price, data, {
        gasLimit,
        gasPrice
      })
      
      console.log("deposit", result)
      return result
    } else {
      //estimateGas
      const _gasLimit = await contract["depositBase((bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"].estimateGas(data)
      
      const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
      const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
      const result =  await contract["depositBase((bytes32,uint256,uint256,address,(uint256,uint256,uint8,uint256)[]))"](data, {
        gasLimit,
        gasPrice
      })
      
      console.log("deposit", result)
      return result
    }
    
    
  } catch (e) {
    throw e
  }
}
