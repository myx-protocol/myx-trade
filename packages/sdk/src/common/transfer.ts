import { ChainId } from "@/config/chain";
import { getERC20Contract } from "@/web3/providers";

export const transfer = async (chainId: ChainId, tokenAddress: string,approveAddress: string, amount:bigint) => {
  try {
    const TokenContract = await getERC20Contract(chainId, tokenAddress);
    // Avoid the user's multiple authorization amount, and the maximum amount will be authorized by default
    const response = await TokenContract.transfer(approveAddress, amount)
    // console.log("transfer amount", amount)
    
    // Wait for block confirmation
    const receipt = await response?.wait()
    
    // console.log(receipt)
    
  } catch (e) {
    // console.error(e)
    throw e
  }
}
