import { ChainId, getSupportedChainIdsByEnv } from "@/config/chain";
import { ErrorCode, Errors } from "@/config/error";
import { getBalanceOf } from "@/common/balanceOf";
import { MaxUint256, parseUnits } from "ethers";
import { getAllowanceApproved } from "@/common/allowance";
import { approve } from "@/common/approve";

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
    const valid =   getSupportedChainIdsByEnv().includes(params.chainId as ChainId);
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
  
  console.log('checkbalance')
  const {tokenAddress,contractAddress, chainId, amount, decimals, account} = params
  if(amount && chainId && decimals && account) {
    
    
    const amountIn = parseUnits (amount.toString (), decimals)
    if (tokenAddress ) {
      const balance = await getBalanceOf (chainId, account, tokenAddress)
      console.log ("balance", balance, tokenAddress);
      
      if (!balance || balance < amountIn) {
        throw new Error (Errors[ErrorCode.Insufficient_Balance]);
      }
    }
    if (contractAddress && tokenAddress) {
      const isApproved = await getAllowanceApproved (chainId, account, tokenAddress, contractAddress, amountIn)
      
      if (!isApproved) {
        await approve (chainId, account, tokenAddress, contractAddress, MaxUint256);
      }
    }
  }
}
