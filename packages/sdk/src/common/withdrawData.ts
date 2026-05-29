import { type Address, MarketPoolState } from "@/api";
import { OracleUpdatePrice } from "@/lp/type.ts";
import { getPriceData } from "@/common/price.ts";
import { parseUnits } from "viem";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.ts";
import { previewBaseAmountOut } from "@/lp/base/preview.ts";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas.ts";
import { ChainId } from "@/config/chain.js";
import { PoolType } from "@/lp/pool/index.js";
import { previewQuoteAmountOut } from "@/lp/quote/preview.ts";
import { isNeedPrice } from "@/utils/isNeedPrice.ts";

export const getWithdrawData = async ({
  amountIn,
  chainId,
  poolId,
  state,
  slippage,
  poolType,
  account,
}: {
  amountIn: bigint;
  account: string;
  chainId: ChainId;
  poolId: string;
  state: MarketPoolState;
  slippage: number;
  poolType: PoolType;
}) => {
  const _isNeedPrice = isNeedPrice(state);

  let amountOut;
  const previewAmountOut =
    poolType === PoolType.Base ? previewBaseAmountOut : previewQuoteAmountOut;
  if (_isNeedPrice) {
    try {
      const priceData = await getPriceData(chainId, poolId);
      if (priceData) {
        const referencePrice = parseUnits(
          priceData.price,
          COMMON_PRICE_DECIMALS,
        );
        amountOut = await previewAmountOut({
          chainId,
          poolId,
          amountIn,
          price: referencePrice,
        });
      }
    } catch (e) {
      console.error(e);
      amountOut = await previewAmountOut({ chainId, poolId, amountIn });
    }
  } else {
    amountOut = await previewAmountOut({ chainId, poolId, amountIn });
  }

  const data = {
    poolId,
    amountIn,
    minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
    recipient: account,
  };

  return {
    data,
  };
};
