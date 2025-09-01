import { getAccount, getLiquidityRouterContract } from "@/web3/providers";
import { type AddressLike, type BytesLike, MaxUint256, parseUnits } from "ethers";
import { ChainId } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains";
import { getBalanceOf } from "@/common/balanceOf";
import { Market } from "@/config/market";
import Address from "@/config/address";
import { approve } from "@/common/approve";
import { getAllowanceApproved } from "@/common/allowance";
import { ErrorCode, Errors } from "@/config/error";
import { Deposit } from "@/lp/type";


export const deposit = async ({poolId, chainId, amount}: Deposit) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    const slipper = 0.01
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = Market[chainId].quoteToken;
    const decimals = Market[chainId].decimals;
    
    const balance = await getBalanceOf(chainId, account, tokenAddress)
    console.log("quote balance", balance, tokenAddress);
    
    const amountIn = parseUnits(amount.toString(), decimals)
    const isApproved = await getAllowanceApproved (chainId, account,tokenAddress,contractAddress ,amountIn)
    
    if (!isApproved) {
      await approve (chainId, account, tokenAddress, contractAddress, MaxUint256);
    }
    
    if (!balance || balance < amountIn) {
      throw new Error(Errors[ErrorCode.Insufficient_Balance]);
    }
    
    const tpslParams = []
    // poolId: BytesLike;
    // amountIn: BigNumberish;
    // minAmountOut: BigNumberish;
    // recipient: AddressLike;
   
    const data = {
      poolId: poolId as unknown as BytesLike,
      amountIn,
      minAmountOut: parseUnits((amount * (1- slipper)).toString(), decimals),// todo  调合约获取
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
