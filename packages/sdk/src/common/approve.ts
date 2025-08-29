import { getERC20Contract } from "@/web3/providers";
import { getAllowanceApproved } from "@/common/allowance";
import { ChainId } from "@/config/chain";
import { ErrorCode, Errors } from "@/config/error";

export const approve = async (chainId: ChainId, account: string, tokenAddress: string,approveAddress: string, amount:bigint) => {
  try {
    const TokenContract = await getERC20Contract(chainId, tokenAddress);
    // Avoid the user's multiple authorization amount, and the maximum amount will be authorized by default
    const response = await TokenContract.approve(approveAddress, amount)
    console.log("approve amount", amount)
    
    // Wait for block confirmation
    const receipt = await response?.wait()
    
    const isApproved = await getAllowanceApproved(chainId, account, tokenAddress, approveAddress, amount );
    if (!isApproved) {
      throw new Error(Errors[ErrorCode.Insufficient_Amount_Of_Approved])
    }
    
  } catch (e) {
    throw e
  }
}
