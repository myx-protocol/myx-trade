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
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains";
import Address from "@/config/address";
import { Market } from "@/config/market";
import { getBalanceOf } from "@/common/balanceOf";
import { getAllowanceApproved } from "@/common/allowance";
import { approve } from "@/common/approve";
import { ErrorCode, Errors } from "@/config/error";
import { Deposit } from "@/lp/type";



export const deposit = async ({poolId, chainId, amount, decimals, tokenAddress}: Deposit & {tokenAddress: string}) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    const slipper = 0.01
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.BASE_POOL;
    
    debugger
    console.log("tokenAddress", tokenAddress);
    const balance = await getBalanceOf(chainId, account, tokenAddress)
    console.log("base balance", balance, tokenAddress);
    
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
