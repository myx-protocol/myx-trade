import { ChainId, isSupportedChainFn } from "@/config/chain.js";
import { ErrorCode, Errors } from "@/config/error.js";
import { getBalanceOf } from "@/common/balanceOf.js";
import { maxUint256, parseUnits } from "viem";
import { getAllowanceApproved } from "@/common/allowance.js";
import { approve } from "@/common/approve.js";

export interface  Optional {
  chainId?: number | ChainId;
  slippage?: number;
  amount?: number,
  decimals?: number;
  tokenAddress?: string;
  contractAddress?: string;
  account?:string;
}
type OptionalParams = Partial<Optional>;

export  const checkParams = async (params: OptionalParams) => {
  
  if ('chainId' in params) {
    const valid =   isSupportedChainFn(params.chainId as ChainId);
    if (!valid) {
      throw new Error(Errors[ErrorCode.Invalid_Chain_ID]);
    }
  }
  
  if ('slippage' in params) {
    if (!(Number(params?.slippage) <= 1 && Number(params?.slippage) > 0)) {
      throw new Error(Errors[ErrorCode.Invalid_slippage]);
    }
  }
  
  if ('amount' in params) {
    if (Number(params.amount) === Number.NaN || Number(params.amount) < 0 ) {
      throw  new Error(Errors[ErrorCode.Invalid_Amount])
    }
  }
  
  // console.log('checkbalance')
  const {tokenAddress,contractAddress, chainId, amount, decimals, account} = params
  if(amount && chainId && Number(decimals) >= 0 && account) {
    
    
    const amountIn = parseUnits(amount.toString(), Number(decimals))
    if (tokenAddress ) {
      const balance = await getBalanceOf (chainId, account, tokenAddress)
      // console.log ("balance", balance, tokenAddress);
      
      if (!balance || balance < amountIn) {
        throw new Error (Errors[ErrorCode.Insufficient_Balance]);
      }
    }
    if (contractAddress && tokenAddress) {
      const isApproved = await getAllowanceApproved (chainId, account, tokenAddress, contractAddress, amountIn)
      
      if (!isApproved) {
        await approve (chainId, account, tokenAddress, contractAddress, maxUint256);
      }
    }
  }
}
