import { getAccount, getExecutionPoolSingerContract } from "@/web3/providers";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { sdkError } from "@/logger";
import { checkParams } from "@/common/checkParams";
import { getErrorTextFormError } from "@/config/error";
import { getWalletClient } from "@/web3";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { execution, forwarder, transactions } from "@/common";
import { getContractAddressByChainId } from "@/config/address";
import { getGasByRatio } from "@/common/tradingGas.js";
export const claimBasePoolRebate = async (params: ClaimParams) => {
  try {
    const { chainId, poolId } = params;

    const account = await getAccount(chainId);

    await checkParams({
      account,
      chainId,
    });

    const { hexData, executionGasFee } =
      await execution.buildHexDataAndExecutionGasFee({
        abi: LiquidityRouter_abi,
        method: "claimBasePoolRebate",
        args: [poolId, account],
        chainId,
      });
    const walletClient = await getWalletClient(chainId);
    const chainAddress = getContractAddressByChainId(chainId);
    const liquidityRouterAddress = chainAddress.LIQUIDITY_ROUTER;

    const { domain, createAt, txId, types, primaryType, signData } =
      await execution.buildSignData({
        chainId,
        data: hexData,
        from: account,
        to: liquidityRouterAddress,
      });

    const signature = await walletClient.signTypedData({
      account,
      domain,
      types,
      primaryType,
      message: signData,
    });
    const executionPoolContract = await getExecutionPoolSingerContract(chainId);
    const _gasLimit = await executionPoolContract.estimateGas!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, [poolId]],
      { value: executionGasFee },
    );
    const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);
    const hash = await executionPoolContract.write!.submit(
      [
        txId,
        {
          ...signData,
          createdAt: BigInt(createAt),
          signature,
        },
        [poolId],
      ],
      {
        value: executionGasFee,
        gasLimit,
        gasPrice,
      },
    );

    const receipt = await transactions.waitForTransactionReceipt(chainId, hash);

    return {
      hash,
      txId,
      receipt,
    };
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};

export const claimBasePoolRebates = async (params: ClaimRebatesParams) => {
  try {
    const { chainId, poolIds } = params;
    if (poolIds.length === 0) return;

    const account = await getAccount(chainId);

    await checkParams({
      account,
      chainId,
    });

    const { hexData, executionGasFee } =
      await execution.buildHexDataAndExecutionGasFee({
        abi: LiquidityRouter_abi,
        method: "claimBasePoolRebates",
        args: [poolIds, account],
        chainId,
      });
    const chainAddress = getContractAddressByChainId(chainId);
    const walletClient = await getWalletClient(chainId);

    const liquidityRouterAddress = chainAddress.LIQUIDITY_ROUTER;

    const { domain, createAt, txId, types, primaryType, signData } =
      await execution.buildSignData({
        chainId,
        data: hexData,
        from: account,
        to: liquidityRouterAddress,
      });

    const signature = await walletClient.signTypedData({
      account,
      domain,
      types,
      primaryType,
      message: signData,
    });
    const executionPoolContract = await getExecutionPoolSingerContract(chainId);
    const _gasLimit = await executionPoolContract.estimateGas!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, poolIds],
      { value: executionGasFee },
    );
    const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);

    const hash = await executionPoolContract.write!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, poolIds],
      { value: executionGasFee, gasLimit, gasPrice },
    );
    const receipt = await transactions.waitForTransactionReceipt(chainId, hash);
    return {
      hash,
      txId,
      receipt,
    };
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
