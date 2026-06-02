import {
  getAccount,
  getBasePoolContract,
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
import { getWithdrawData } from "@/common/withdrawData.ts";
import { PoolType } from "@/lp/pool";
import { MarketPoolState } from "@/api";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { signAndSubmit } from "@/common/signAndSubmit";

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

    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_abi,
      method: "withdrawBase",
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
