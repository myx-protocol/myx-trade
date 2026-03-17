import { getPublicClient } from "@/web3/viemClients.js";
import { ChainId } from "@/config/chain.js";
import TOKEN_ABI from "@/abi/IERC20Metadata.json";

export const getBalanceOf = async (chainId: ChainId, account: string, tokenAddress: string) => {
  try {
    const client = getPublicClient(chainId);
    const balance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: TOKEN_ABI as never,
      functionName: "balanceOf",
      args: [account as `0x${string}`],
    });
    return balance as bigint;
  } catch (e) {
    console.error(e);
    throw e;
  }
}


