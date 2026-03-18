import { ChainId } from "@/config/chain.js";
import { getERC20Contract } from "@/web3/providers.js";
import { getPublicClient } from "@/web3/viemClients.js";
import { type Address } from "@/api";

export const transfer = async (chainId: ChainId, tokenAddress: string, approveAddress: string, amount: bigint) => {
  try {
    const tokenContract = await getERC20Contract(chainId, tokenAddress);
    if (!tokenContract.write) throw new Error("Wallet client required for write");
    const hash = await tokenContract.write.transfer([approveAddress as Address, amount]) as Address;
    const client = getPublicClient(chainId);
    await client.waitForTransactionReceipt({ hash });
  } catch (e) {
    throw e;
  }
};
