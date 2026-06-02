import { parseUnits } from "viem";
import { ChainId } from "@/config/chain.js";
import { MarketPoolState } from "@/api/index.js";
import { getPriceData } from "@/common/price.js";
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
} from "@/config/decimals.js";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import { isNeedPrice } from "@/utils/isNeedPrice.ts";
import type { TpSl } from "@/lp/pool/type.js";
import type { DepositTpSl, previewAmountOutParams } from "@/lp/type.js";

export const getDepositData = async ({
  poolId,
  chainId,
  account,
  amountIn,
  amount,
  slippage,
  state,
  quoteDecimals,
  tpsl,
  previewLpAmountOut,
}: {
  poolId: string;
  chainId: ChainId;
  account: string;
  amountIn: bigint;
  amount: string | number;
  slippage: number;
  state: MarketPoolState;
  quoteDecimals: number;
  tpsl: DepositTpSl[];
  previewLpAmountOut: (params: previewAmountOutParams) => Promise<bigint>;
}) => {
  const _isNeedPrice = isNeedPrice(state);
  let amountOut: bigint;

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
  const minAmountOut = bigintAmountSlipperCalculator(amountOut, slippage);

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

  return {
    data: {
      poolId,
      amountIn,
      minAmountOut,
      recipient: account,
      tpslParams,
    },
  };
};
