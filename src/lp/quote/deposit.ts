import { getAccount, getLiquidityRouterContract } from "@/utils/web3/providers";
import { type AddressLike, type BytesLike, MaxUint256, parseUnits } from "ethers";
import { ChainId } from "@/config/chain";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/utils/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains";
import { getBalanceOf } from "@/utils/common/balanceOf";
import { Market } from "@/config/market";
import Address from "@/config/address";
import { approve } from "@/utils/common/approve";
import { getAllowanceApproved } from "@/utils/common/allowance";
import { ErrorCode, Errors } from "@/config/error";

interface Deposit {
  chainId: ChainId,
  poolId: string;
  decimals?: number;
  // address: AddressLike;
  amount: number;
}

export const deposit = async ({poolId, chainId, amount, decimals = 6}: Deposit) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    const account = await getAccount (chainId);
    const slipper = 0.01
    
    const addresses = Address[chainId as keyof typeof Address];
    const contractAddress = addresses.QUOTE_POOL;
    
    const tokenAddress = Market[chainId].quoteToken;
    
    const balance = await getBalanceOf(chainId, account, tokenAddress)
    console.log("quote balance", balance, tokenAddress);
    
    const amountIn = parseUnits(amount.toString(), decimals)
    const isApproved = await getAllowanceApproved (chainId, account,tokenAddress,contractAddress ,amountIn)
    
    if (!isApproved) {
      await approve (chainId, account, tokenAddress, contractAddress, MaxUint256);
    }
    
    
    
    if (!balance || balance < amountIn) {
      throw new Error(Errors[ErrorCode.Invalid_TOKEN_ADDRESS]);
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
