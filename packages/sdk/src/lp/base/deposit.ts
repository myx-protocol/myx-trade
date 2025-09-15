import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import {
  type AddressLike,
  type BigNumberish,
  type BytesLike,
  hexlify,
  MaxUint256,
  parseEther,
  parseUnits
} from "ethers";
import { ChainId } from "@/config/chain";
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



export const deposit = async (params: Deposit) => {
  try {
    const {poolId, chainId, amount, slippage = 0.01}= params;
    await checkParams(params)
    
    const pool = await getPoolInfo(poolId);
    const decimals = pool?.baseDecimals
    const tokenAddress = pool?.baseToken
    
    
    const chainInfo =  CHAIN_INFO[chainId];
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
    
    const amountIn = parseUnits(amount.toString(), decimals)
    const amountOut = await previewLpAmountOut({chainId, poolId, amountIn})
    
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams: []
    }
    
    console.log("deposit base", data);
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract.depositBase.estimateGas(data)
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract.depositBase(data, {
      gasLimit,
      gasPrice
    })
    
    console.log("deposit", result)
  } catch (e) {
    throw e
  }
}
