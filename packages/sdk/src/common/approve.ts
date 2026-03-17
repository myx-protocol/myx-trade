import { getERC20Contract } from "@/web3/providers.js";
import { getPublicClient } from "@/web3/viemClients.js";
import { ChainId } from "@/config/chain.js";

export const approve = async (chainId: ChainId, _account: string, tokenAddress: string, approveAddress: string, amount: bigint) => {
  try {
    const contract = await getERC20Contract(chainId, tokenAddress);
    if (!contract.write) throw new Error("Wallet client required for write");
    const hash = await contract.write.approve([approveAddress as `0x${string}`, amount]) as `0x${string}`;
    const client = getPublicClient(chainId);
    await client.waitForTransactionReceipt({ hash });
  } catch (e) {
    throw e;
  }
};
