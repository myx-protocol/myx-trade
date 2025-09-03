import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { type AddressLike, type BytesLike, MaxUint256, parseUnits } from "ethers";
import { ChainId } from "@/config/chain";
import {
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator
} from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains";
import { getBalanceOf } from "@/common/balanceOf";
import { Market } from "@/config/market";
import Address from "@/config/address";
import { approve } from "@/common/approve";
import { getAllowanceApproved } from "@/common/allowance";
import { ErrorCode, Errors } from "@/config/error";
import { Deposit } from "@/lp/type";
import { checkParams } from "@/common/checkParams";
import { previewLpAmountOut } from "@/lp/quote/preview";


export const deposit = async (params: Deposit) => {
  try {
    const {poolId, chainId, amount, slippage = 0.01} = params;
    await checkParams(params)
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = Market[chainId].quoteToken;
    const decimals = Market[chainId].decimals;
    
   
    await checkParams ({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    })
    
    const amountIn = parseUnits(amount.toString(), decimals)
    
    const amountOut = await previewLpAmountOut ({ chainId, poolId, amountIn})
   
    console.log(amountOut)
    const tpslParams = []
    // poolId: BytesLike;
    // amountIn: BigNumberish;
    // minAmountOut: BigNumberish;
    // recipient: AddressLike;
   console.log((amount * (1- slippage)))
    debugger
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),// todo  调合约获取
      recipient: account,
      tpslParams: []
    }
    
    console.log("deposit", data);
    
    const contract = await getLiquidityRouterContract(chainId)
    //estimateGas
    const _gasLimit =  await contract.depositQuote.estimateGas(data)
    
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice} = await bigintTradingGasPriceWithRatio (chainId);
    const result = await contract.depositQuote(data, {
      gasLimit,
      gasPrice
    })
    
    console.log("deposit", result)
  } catch (e) {
    console.error(e)
    throw e
  }
}
