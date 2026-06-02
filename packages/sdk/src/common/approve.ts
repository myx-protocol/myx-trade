import { getERC20Contract } from "@/web3/providers.js";
import { getPublicClient } from "@/web3/viemClients.js";
import { ChainId } from "@/config/chain.js";
import { type Address } from "@/api/index.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.ts";
import { CHAIN_INFO } from "@/config/chains/index.js";

export const approve = async (chainId: ChainId, _account: string, tokenAddress: string, approveAddress: string, amount: bigint) => {
  try {
    const chainInfo = CHAIN_INFO[chainId];
    const contract = await getERC20Contract(chainId, tokenAddress);
    if (!contract.write) throw new Error("Wallet client required for write");
    // 1️⃣ estimate gas
    const _gasLimit = await contract!.estimateGas!.approve([approveAddress as Address, amount]);
    const gasLimit = bigintTradingGasToRatioCalculator (_gasLimit, chainInfo.gasLimitRatio)
    const { gasPrice } = await bigintTradingGasPriceWithRatio (chainId)
    
    const hash = await contract.write.approve([approveAddress as Address, amount],{gasLimit, gasPrice}) as Address;
    const client = getPublicClient(chainId);
    await client.waitForTransactionReceipt({ hash });
  } catch (e) {
    throw e;
  }
};
