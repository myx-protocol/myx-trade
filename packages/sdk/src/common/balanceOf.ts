import { getJSONProvider } from "@/web3";
import { ethers, parseUnits } from "ethers";
import { ChainId } from "@/config/chain";
import TOKEN_ABI from "@/abi/IERC20Metadata.json"


export const getBalanceOf = async (chainId: ChainId, address: string, tokenAddress: string) => {
  try {
    const provider = getJSONProvider(chainId);
    const contractInterface = new ethers.Interface(TOKEN_ABI)
    const data = contractInterface.encodeFunctionData('balanceOf', [address])
    
    const callData = {
      to: tokenAddress,
      data,
    }
    const result = await provider.call(callData)
    
    const balance = BigInt(result)
    return balance
  } catch (e) {
    console.error(e)
  }
}


