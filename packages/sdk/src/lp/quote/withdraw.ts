import { getAccount, getQuotePoolContract } from "@/web3/providers.js";
import { parseUnits } from "viem";
import { WithdrawParams } from "@/lp/type.js";

import { checkParams } from "@/common/checkParams.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { MarketPoolState } from "@/api/index.js";
import { getPriceData } from "@/common/price.js";
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
} from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { ChainId } from "@/config/chain.js";
import { sdkError } from "@/logger";
import { getWithdrawData } from "@/common/withdrawData.ts";
import { PoolType } from "@/lp/pool";
import LiquidityRouter_ABI from "@/abi/LiquidityRouter.json";
import { signAndSubmit } from "@/common/signAndSubmit";

export const withdrawableLpAmount = async (params: {
  chainId: ChainId;
  poolId: string;
  price?: bigint;
}) => {
  try {
    const { chainId, poolId, price } = params;
    let referencePrice = price;
    const quotePoolContract = await getQuotePoolContract(chainId);
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

    const request = await quotePoolContract.read.withdrawableLpAmount([
      poolId,
      referencePrice || 0n,
    ]);
    return request;
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};

export const withdraw = async (params: WithdrawParams) => {
  try {
    const { chainId, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo(chainId, poolId);
    const lpAddress = pool?.quotePoolToken;

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
      poolType: PoolType.Quote,
      state: pool?.state as MarketPoolState,
    });
    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_ABI,
      method: "withdrawQuote",
      args: [data],
      poolIds: [poolId],
    });
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
