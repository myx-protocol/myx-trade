import { getAccount } from "@/web3/providers.js";
import { parseUnits } from "viem";
import { sdkError } from "@/logger";
import { getContractAddressByChainId } from "@/config/address/index.js";

import { Deposit } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/base/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { getDepositData } from "@/common/depositData.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { MarketPoolState } from "@/api/index.js";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { signAndSubmit } from "@/common/signAndSubmit";

export const deposit = async (params: Deposit) => {
  try {
    const { poolId, chainId, amount, slippage = 0.01, tpsl = [] } = params;
    await checkParams(params);

    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params]);
    }
    const decimals = pool?.baseDecimals;
    const quoteDecimals = pool?.quoteDecimals;
    const tokenAddress = pool?.baseToken;

    const account = await getAccount(chainId);

    const addresses = getContractAddressByChainId(chainId);
    const contractAddress = addresses.BASE_POOL;

    await checkParams({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    });

    const amountIn = parseUnits(amount.toString(), decimals);
    const result = await getDepositData({
      poolId,
      chainId,
      account,
      amountIn,
      amount,
      slippage,
      state: pool.state as MarketPoolState,
      quoteDecimals,
      tpsl,
      previewLpAmountOut,
    });
    if (!result) return;

    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_abi,
      method: "depositBase",
      args: [result.data],
      poolIds: [poolId],
    });
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
