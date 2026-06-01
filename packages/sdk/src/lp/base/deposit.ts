import {
  getAccount,
} from "@/web3/providers.js";
import { parseUnits } from "viem";
import { sdkError } from "@/logger";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas.js";
import { getContractAddressByChainId } from "@/config/address/index.js";

import { Deposit } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/base/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
} from "@/config/decimals.js";
import { getPriceData } from "@/common/price.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import type { TpSl } from "@/lp/pool/type.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { isNeedPrice } from "@/utils/isNeedPrice.ts";
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

    const _isNeedPrice = isNeedPrice(pool?.state);
    const amountIn = parseUnits(amount.toString(), decimals);
    let amountOut;
    if (_isNeedPrice) {
      const priceData = await getPriceData(chainId, poolId);
      if (!priceData) return;
      const referencePrice = parseUnits(priceData.price, COMMON_PRICE_DECIMALS);

      amountOut = await previewLpAmountOut({
        chainId,
        poolId,
        amountIn,
        price: referencePrice,
      });
    } else {
      amountOut = await previewLpAmountOut({ chainId, poolId, amountIn });
    }

    const _tpsl = tpsl.map((item) => {
      return {
        amount,
        triggerPrice: item.triggerPrice,
        triggerType: item.triggerType,
      } as TpSl;
    });
    const tpslParams = getTpSlParams(
      slippage,
      _tpsl,
      COMMON_LP_AMOUNT_DECIMALS,
      quoteDecimals,
    );
    const minAmountOut = bigintAmountSlipperCalculator(amountOut, slippage);
    const data = {
      poolId,
      amountIn,
      minAmountOut,
      recipient: account,
      tpslParams,
    };
    return await signAndSubmit({
      chainId,
      account,
      abi: LiquidityRouter_abi,
      method: "depositBase",
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
