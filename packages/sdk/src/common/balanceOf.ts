import { getPublicClient } from "@/web3/viemClients.js";
import { sdkError } from "@/logger";
import { ChainId } from "@/config/chain.js";
import TOKEN_ABI from "@/abi/IERC20Metadata.json";
import { type Address } from "@/api";

export const getBalanceOf = async (chainId: ChainId, account: string, tokenAddress: string) => {
  try {
    const client = getPublicClient(chainId);
    const balance = await client.readContract({
      address: tokenAddress as Address,
      abi: TOKEN_ABI as never,
      functionName: "balanceOf",
      args: [account as Address],
    });
    return balance as bigint;
  } catch (e) {
    sdkError(e);
    throw e;
  }
}


