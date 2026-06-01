import { getExecutionPoolSingerContract } from "@/web3/providers";
import { getWalletClient } from "@/web3";
import { getContractAddressByChainId } from "@/config/address";
import { execution, transactions } from "@/common";
import { getGasByRatio } from "@/common/tradingGas";
import { ChainId, Address } from "@/config/chain";

interface SignAndSubmitParams {
  chainId: ChainId;
  account: Address;
  abi: any;
  method: string;
  args: any[];
  poolIds: string[];
}

export const signAndSubmit = async ({
  chainId,
  account,
  abi,
  method,
  args,
  poolIds,
}: SignAndSubmitParams) => {
  const chainAddress = getContractAddressByChainId(chainId);

  const { hexData, executionGasFee } =
    await execution.buildHexDataAndExecutionGasFee({
      abi,
      method,
      args,
      chainId,
    });

  const { domain, createAt, txId, types, primaryType, signData } =
    await execution.buildSignData({
      from: account,
      chainId,
      to: chainAddress.LIQUIDITY_ROUTER,
      data: hexData,
    });

  const walletClient = await getWalletClient(chainId);
  const signature = await walletClient.signTypedData({
    account,
    domain,
    types,
    primaryType,
    message: signData,
  });

  const executionPoolContract = await getExecutionPoolSingerContract(chainId);
  const submitArgs = [
    txId,
    { ...signData, createdAt: BigInt(createAt), signature },
    poolIds,
  ] as const;

  const _gasLimit = await executionPoolContract.estimateGas!.submit(submitArgs, {
    value: executionGasFee,
  });
  const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);
  const hash = await executionPoolContract.write!.submit(submitArgs, {
    value: executionGasFee,
    gasLimit,
    gasPrice,
  });

  const receipt = await transactions.waitForTransactionReceipt(chainId, hash);

  return { hash, txId, receipt };
};
