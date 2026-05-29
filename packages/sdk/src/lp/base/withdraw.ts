import {
  getAccount,
  getBasePoolContract,
  getExecutionPoolSingerContract,
} from "@/web3/providers.js";
import { parseUnits } from "viem";
import { WithdrawParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { checkParams } from "@/common/checkParams.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { getPriceData } from "@/common/price.js";
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
} from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { ChainId } from "@/config/chain.js";
import { getWalletClient } from "@/web3";
import { getWithdrawData } from "@/common/withdrawData.ts";
import { PoolType } from "@/lp/pool";
import { MarketPoolState } from "@/api";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { getContractAddressByChainId } from "@/config/address";
import { execution, transactions } from "@/common";
import { getGasByRatio } from "@/common/tradingGas.js";

export const withdrawableLpAmount = async (params: {
  chainId: ChainId;
  poolId: string;
  price?: bigint;
}) => {
  try {
    const { chainId, poolId, price } = params;
    let referencePrice = price;
    const basePoolContract = await getBasePoolContract(chainId);
    if (typeof price === "undefined" || price === null) {
      try {
        const priceData = await getPriceData(chainId, poolId);
        referencePrice = parseUnits(
          priceData?.price || "0",
          COMMON_PRICE_DECIMALS,
        );
      } catch (error) {
        referencePrice = parseUnits("0", COMMON_PRICE_DECIMALS);
      }
    }

    const request = await basePoolContract.read.withdrawableLpAmount([
      poolId,
      referencePrice || 0n,
    ]);
    // console.log(`base pool withdrawableLpAmount: ${request}`)

    return request;
  } catch (error) {
    // sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};

export const withdraw = async (params: WithdrawParams) => {
  try {
    const { chainId, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo(chainId, poolId);
    const lpAddress = pool?.basePoolToken;

    const chainInfo = CHAIN_INFO[chainId];
    const account = await getAccount(chainId);

    const decimals = COMMON_LP_AMOUNT_DECIMALS;

    await checkParams({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId,
      amount,
    });

    const amountIn = parseUnits(amount.toString(), decimals);

    const { data } = await getWithdrawData({
      poolId,
      chainId,
      account,
      amountIn,
      slippage,
      poolType: PoolType.Base,
      state: pool?.state as MarketPoolState,
    });

    const chainAddress = getContractAddressByChainId(chainId);

    const { hexData, executionGasFee } =
      await execution.buildHexDataAndExecutionGasFee({
        abi: LiquidityRouter_abi,
        method: "withdrawBase",
        args: [data],
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
