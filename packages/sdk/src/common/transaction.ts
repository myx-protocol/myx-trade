import { TransactionHash } from "@/types/common";
import { getPublicClient } from "@/web3";

export const waitForTransactionReceipt = async (
  chainId: number,
  hash: TransactionHash,
) => {
  const client = getPublicClient(chainId);
  return client.waitForTransactionReceipt({ hash });
};
