import { getAccount } from "@/web3/providers.js";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { signAndSubmit } from "@/common/signAndSubmit";

export const claimQuotePoolRebate = async (params: ClaimParams) => {
  try {
    const { chainId, poolId } = params;

    const account = await getAccount(chainId);

    await checkParams({
      account,
      chainId,
    });

    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_abi,
      method: "claimQuotePoolRebate",
      args: [poolId, account],
      poolIds: [poolId],
    });
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
    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_abi,
      method: "claimQuotePoolRebates",
      args: [poolIds, account],
      poolIds,
    });
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
