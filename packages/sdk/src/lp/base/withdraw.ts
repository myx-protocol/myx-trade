import { getLiquidityRouterContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import type { AddressLike } from "ethers";
import { parseEther, parseUnits, hexlify } from "ethers";

interface WithdrawParams {
  chainId: ChainId;
  poolId: string;
  account: AddressLike;
  amount: string | number;
  minAmount : string | number;
}
export const withdraw = async (
  {
    chainId,
    poolId,
    account,
    amount,
    minAmount,
  }: WithdrawParams
) => {
  try {
    // check chainId
    // check poolId
    // amountIn
    // minAmountOut
    // recipient
    
    const amountIn = amount
    
    // 检查 lp 授权额度 > amountIn
    
    const data = {
      poolId,
      amountIn: parseEther(amountIn.toString()),
      minAmountOut: parseEther(minAmount.toString()),
      recipient: account
    }
    
    const contract = await getLiquidityRouterContract(chainId)
    
    // estimateGas
    const _gasLimit = await contract.withdrawBase.estimateGas(data)
    
    return await contract.withdrawBase (data, {
    
    })
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}


