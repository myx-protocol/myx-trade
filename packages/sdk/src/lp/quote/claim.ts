import {
  getAccount,
  getExecutionPoolSingerContract,
} from "@/web3/providers.js";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";

import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { getWalletClient } from "@/web3";
import { encodeFunctionData } from "viem";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { execution, transactions } from "@/common";
import { getContractAddressByChainId } from "@/config/address";
import { getGasByRatio } from "@/common/tradingGas.js";

export const claimQuotePoolRebate = async (params: ClaimParams) => {
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
        method: "claimQuotePoolRebate",
        args: [poolId, account],
        chainId,
      });
    const chainAddress = getContractAddressByChainId(chainId);
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
    const _gasLimit = await executionPoolContract.estimateGas!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, [poolId]],
      { value: executionGasFee },
    );
    const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);
    const hash = await executionPoolContract.write!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, [poolId]],
      { value: executionGasFee, gasLimit, gasPrice },
    );
    const receipt = await transactions.waitForTransactionReceipt(chainId, hash);
    return {
      txId,
      receipt,
      hash,
    };
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};

export const claimQuotePoolRebates = async (params: ClaimRebatesParams) => {
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
        method: "claimQuotePoolRebates",
        args: [poolIds, account],
        chainId,
      });

    const chainAddress = getContractAddressByChainId(chainId);

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
    const _gasLimit = await executionPoolContract.estimateGas!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, poolIds],
      { value: 0n },
    );

    const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);
    const hash = await executionPoolContract.write!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, poolIds],
      { value: executionGasFee, gasLimit, gasPrice },
    );
    const receipt = await transactions.waitForTransactionReceipt(chainId, hash);
    return {
      txId,
      receipt,
      hash,
    };
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
