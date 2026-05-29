import { getAccount } from "@/web3/providers.js";
import { encodeFunctionData, parseUnits } from "viem";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas.js";
import { Deposit, type OracleUpdatePrice } from "@/lp/type.js";
import { checkParams } from "@/common/checkParams.js";
import { previewLpAmountOut } from "@/lp/quote/preview.js";
import { getPoolInfo } from "@/lp/getPoolInfo.js";
import { getPriceData } from "@/common/price.js";
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
} from "@/config/decimals.js";
import type { TpSl } from "@/lp/pool/index.js";
import { getTpSlParams } from "@/common/getTpSlParams.js";
import { ErrorCode, Errors, getErrorTextFormError } from "@/config/error.js";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { getWalletClient } from "@/web3";
import { sdkError } from "@/logger";
import { isNeedPrice } from "@/utils/isNeedPrice";
import LiquidityRouter_ABI from "@/abi/LiquidityRouter.json";
import { execution, transactions } from "@/common";
import { getExecutionPoolSingerContract } from "@/web3/providers";

export const deposit = async (params: Deposit) => {
  try {
    const { poolId, chainId, amount, slippage = 0.01, tpsl = [] } = params;
    await checkParams(params);
    const pool = await getPoolInfo(chainId, poolId);
    if (!pool) {
      throw new Error(Errors[ErrorCode.Invalid_Params]);
    }
    const account = await getAccount(chainId);

    const addresses = getContractAddressByChainId(chainId);
    const contractAddress = addresses.QUOTE_POOL;

    const tokenAddress = pool.quoteToken;
    const decimals = pool?.quoteDecimals;

    await checkParams({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId,
      amount,
    });

    const amountIn = parseUnits(amount.toString(), decimals);

    const _isNeedPrice = isNeedPrice(pool?.state);

    let amountOut;

    if (_isNeedPrice) {
      // todo  getprice
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
      decimals,
    );
    const minAmountOut = bigintAmountSlipperCalculator(amountOut, slippage);
    const data = {
      poolId,
      amountIn,
      minAmountOut,
      recipient: account,
      tpslParams,
    } as const;

    const hexData = encodeFunctionData({
      abi: LiquidityRouter_ABI,
      functionName: "depositQuote",
      args: [data],
    });

    const { domain, createAt, txId, types, primaryType, signData } =
      await execution.buildSignData({
        from: account,
        chainId,
        to: addresses.LIQUIDITY_ROUTER,
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

    const executionPoolContract = await getExecutionPoolSingerContract(
      chainId
    );
    const hash = await executionPoolContract.write!.submit(
      [txId, { ...signData, createdAt: BigInt(createAt), signature }, [poolId]],
      { value: 0n, gas: signData.gas },
    );

    const receipt = await transactions.waitForTransactionReceipt(chainId, hash);
    return {
      txId,
      receipt,
      hash,
    };
  } catch (error) {
    sdkError(error);
    throw typeof error === "string"
      ? error
      : await getErrorTextFormError(error);
  }
};
