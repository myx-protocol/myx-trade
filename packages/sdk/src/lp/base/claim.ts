import { getAccount, getExecutionPoolSingerContract } from "@/web3/providers";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { sdkError } from "@/logger";
import { checkParams } from "@/common/checkParams";
import { getErrorTextFormError } from "@/config/error";
import { getWalletClient } from "@/web3";
import { encodeFunctionData } from "viem";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { execution, forwarder, transactions } from "@/common";
import { getContractAddressByChainId } from "@/config/address";
import { FORWARD_GAS_LIMIT } from "@/config/fee";

export const claimBasePoolRebate = async (params: ClaimParams) => {
  try {
    const { chainId, poolId } = params;

    const account = await getAccount(chainId);

    await checkParams({
      account,
      chainId,
    });
    const hexData = encodeFunctionData({
      abi: LiquidityRouter_abi,
      functionName: "claimBasePoolRebate",
      args: [poolId, account],
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
    const executionPoolContract = await getExecutionPoolSingerContract(
      chainId,
      chainAddress.EXECUTION_POOL,
    );
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
        value: 0n,
        gas: signData.gas,
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

    const hexData = encodeFunctionData({
      abi: LiquidityRouter_abi,
      functionName: "claimBasePoolRebates",
      args: [poolIds, account],
    });
    const chainAddress = getContractAddressByChainId(chainId);
    const walletClient = await getWalletClient(chainId);

    const liquidityRouterAddress = chainAddress.LIQUIDITY_ROUTER;
    const executionPoolAddress = chainAddress.EXECUTION_POOL;

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
    const executionPoolContract = await getExecutionPoolSingerContract(
      chainId,
      executionPoolAddress,
    );
    const hash = await executionPoolContract.write!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, poolIds],
      { value: 0n, gas: signData.gas },
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
