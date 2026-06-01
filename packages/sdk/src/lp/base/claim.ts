import { getAccount } from "@/web3/providers";
import { ClaimParams, ClaimRebatesParams } from "@/lp/type.js";
import { sdkError } from "@/logger";
import { checkParams } from "@/common/checkParams";
import { getErrorTextFormError } from "@/config/error";
import LiquidityRouter_abi from "@/abi/LiquidityRouter.json";
import { signAndSubmit } from "@/common/signAndSubmit";

export const claimBasePoolRebate = async (params: ClaimParams) => {
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
      method: "claimBasePoolRebate",
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

export const claimBasePoolRebates = async (params: ClaimRebatesParams) => {
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
      method: "claimBasePoolRebates",
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
