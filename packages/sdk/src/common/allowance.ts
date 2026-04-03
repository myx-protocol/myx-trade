import { getPublicClient } from "@/web3/viemClients.js";
import { ChainId } from "@/config/chain.js";
import TOKEN_ABI from "@/abi/IERC20Metadata.json";
import type { Address } from "@/api";

export const getAllowanceApproved = async (chainId: ChainId, account: string, tokenAddress: string, approveAddress: string, approveAmount: bigint) => {
  try {
    const client = getPublicClient(chainId);
    const allowance = await client.readContract({
      address: tokenAddress as Address,
      abi: TOKEN_ABI as never,
      functionName: "allowance",
      args: [account as Address, approveAddress as Address],
    });
    if ((allowance as bigint) >= approveAmount) return true;
    return false;
  } catch (e) {
    throw e;
  }
}
