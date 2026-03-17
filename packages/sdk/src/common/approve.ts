import { getERC20Contract } from "@/web3/providers.js";
import { ChainId } from "@/config/chain.js";

export const approve = async (chainId: ChainId, account: string, tokenAddress: string,approveAddress: string, amount:bigint) => {
  try {
    const TokenContract = await getERC20Contract(chainId, tokenAddress);
    // console.log("approve token Address", tokenAddress);
    // Avoid the user's multiple authorization amount, and the maximum amount will be authorized by default
    const response = await TokenContract.approve(approveAddress, amount)
    // console.log("approve amount", approveAddress)
    // console.log("approve amount", amount)
    
    // Wait for block confirmation
    await response?.wait()
    
  } catch (e) {
    throw e
  }
}
