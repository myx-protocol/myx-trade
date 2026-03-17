import { getJSONProvider } from "@/web3/index.js";
import { ethers, parseUnits } from "ethers";
import { ChainId } from "@/config/chain.js";
import TOKEN_ABI from "@/abi/IERC20Metadata.json"
// import PoolToken_ABI from "@/abi/PoolToken.json"


export const getBalanceOf = async (chainId: ChainId, account: string, tokenAddress: string) => {
  try {
    const provider = getJSONProvider(chainId);
    const contractInterface = new ethers.Interface( TOKEN_ABI)
    const data = contractInterface.encodeFunctionData('balanceOf', [account])
    
    const callData = {
      to: tokenAddress,
      data,
    }
    const result = await provider.call(callData)
    const balance = BigInt(result)
    return balance
  } catch (e) {
    console.error(e)
    throw e
  }
}


