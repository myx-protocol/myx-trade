import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { Route as V2Route } from "@uniswap/v2-sdk";
import { Pair } from "@uniswap/v2-sdk";
import { Trade as RouterTrade } from "@uniswap/router-sdk";
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS, UniversalRouterVersion } from "@uniswap/universal-router-sdk";
import { getPublicClient } from "@/web3/viemClients.js";
import type { SwapQuoteParams, SwapQuoteResult, NativeTokenPriceResult } from "./types.js";
import { parseUnits, formatUnits } from "viem";

const V2_PAIR_ABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const V2_FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
    ],
    name: "getPair",
    outputs: [{ name: "pair", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const UNISWAP_V2_FACTORY: Record<number, `0x${string}`> = {
  1:      "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  42161:  "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
  56:     "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  97:     "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  59144:  "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
  421614: "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
  4663:   "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
};

const WETH_ADDRESS: Record<number, `0x${string}`> = {
  1:      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  42161:  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  421614: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
  59144:  "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34e",
  59141:  "0x2C1b868d6596a18e32E61B901E4060C872647b6D",
  56:     "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  97:     "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  4663:   "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
};

const CHAIN_ROUTER_VERSION: Record<number, UniversalRouterVersion> = {
  4663: UniversalRouterVersion.V2_1_1,
};

function getRouterVersion(chainId: number): UniversalRouterVersion {
  return CHAIN_ROUTER_VERSION[chainId] ?? UniversalRouterVersion.V2_0;
}

async function findV2Pair(
  publicClient: ReturnType<typeof getPublicClient>,
  factoryAddress: `0x${string}`,
  tokenA: Token,
  tokenB: Token,
): Promise<Pair> {
  const pairAddress = await publicClient.readContract({
    address: factoryAddress,
    abi: V2_FACTORY_ABI,
    functionName: "getPair",
    args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`],
  });

  if (!pairAddress || pairAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`No V2 pair found for ${tokenA.symbol}/${tokenB.symbol} on chainId ${tokenA.chainId}`);
  }

  const [reserves, token0] = await Promise.all([
    publicClient.readContract({ address: pairAddress, abi: V2_PAIR_ABI, functionName: "getReserves" }),
    publicClient.readContract({ address: pairAddress, abi: V2_PAIR_ABI, functionName: "token0" }),
  ]);

  const [token0Sdk, token1Sdk] = token0.toLowerCase() === tokenA.address.toLowerCase()
    ? [tokenA, tokenB]
    : [tokenB, tokenA];

  return new Pair(
    CurrencyAmount.fromRawAmount(token0Sdk, reserves[0].toString()),
    CurrencyAmount.fromRawAmount(token1Sdk, reserves[1].toString()),
  );
}

export class Swap {
  async getQuote(params: SwapQuoteParams): Promise<SwapQuoteResult> {
    const {
      chainId,
      tokenIn,
      tokenInDecimals,
      tokenInSymbol,
      tokenOut,
      tokenOutDecimals,
      tokenOutSymbol,
      amountIn,
      slippageTolerance = 0.005,
      recipient,
      paymentToken,
    } = params;

    const v2FactoryAddress = UNISWAP_V2_FACTORY[chainId];
    if (!v2FactoryAddress) {
      throw new Error(`No V2 factory configured for chainId ${chainId}`);
    }

    const sdkTokenIn = new Token(chainId, tokenIn, tokenInDecimals, tokenInSymbol);
    const sdkTokenOut = new Token(chainId, tokenOut, tokenOutDecimals, tokenOutSymbol);
    const publicClient = getPublicClient(chainId);
    const amountInRaw = parseUnits(amountIn, tokenInDecimals);
    const currencyAmountIn = CurrencyAmount.fromRawAmount(sdkTokenIn, amountInRaw.toString());
    const slippagePercent = new Percent(Math.floor(slippageTolerance * 10000), 10000);
    const universalRouterAddress = UNIVERSAL_ROUTER_ADDRESS(getRouterVersion(chainId), chainId) as `0x${string}`;
    const deadline = Math.floor(Date.now() / 1000) + 1800;

    const pair = await findV2Pair(publicClient, v2FactoryAddress, sdkTokenIn, sdkTokenOut);
    const v2Route = new V2Route([pair], sdkTokenIn, sdkTokenOut);
    const [outputAmount] = pair.getOutputAmount(currencyAmountIn);
    const amountOutMinFraction = outputAmount.asFraction.multiply(
      new Percent(10000 - Math.floor(slippageTolerance * 10000), 10000),
    );
    const amountOutMin = CurrencyAmount.fromFractionalAmount(
      sdkTokenOut,
      amountOutMinFraction.numerator,
      amountOutMinFraction.denominator,
    );
    const routerTrade = new RouterTrade({
      v2Routes: [{ routev2: v2Route, inputAmount: currencyAmountIn, outputAmount }],
      tradeType: TradeType.EXACT_INPUT,
    });
    const { calldata } = SwapRouter.swapCallParameters(routerTrade, {
      slippageTolerance: slippagePercent,
      recipient,
      deadlineOrPreviousBlockhash: deadline.toString(),
    });
    const exchangeRate = outputAmount.divide(currencyAmountIn).toSignificant(6);
    const amountOutMinFixed = amountOutMin.toFixed(tokenOutDecimals);
    return {
      amountOut: outputAmount.toSignificant(tokenOutDecimals),
      amountOutMin: amountOutMin.toSignificant(tokenOutDecimals),
      exchangeRate,
      feeTier: 0,
      swapData: calldata as `0x${string}`,
      swapTarget: universalRouterAddress,
      paymentAmount: amountInRaw.toString(),
      paymentToken: paymentToken ?? tokenIn,
      minQuoteOut: parseUnits(amountOutMinFixed, tokenOutDecimals).toString(),
    };
  }

  async getNativeTokenPrice(chainId: number, quoteToken: `0x${string}`, quoteDecimals: number): Promise<NativeTokenPriceResult> {
    const wethAddress = WETH_ADDRESS[chainId];
    const v2FactoryAddress = UNISWAP_V2_FACTORY[chainId];

    if (!wethAddress) throw new Error(`WETH address not configured for chainId ${chainId}`);
    if (!v2FactoryAddress) throw new Error(`No V2 factory configured for chainId ${chainId}`);

    const wethToken = new Token(chainId, wethAddress, 18, "WETH");
    const quoteTokenSdk = new Token(chainId, quoteToken, quoteDecimals, "QUOTE");
    const publicClient = getPublicClient(chainId);

    const pair = await findV2Pair(publicClient, v2FactoryAddress, wethToken, quoteTokenSdk);
    const wethReserve = pair.token0.address.toLowerCase() === wethAddress.toLowerCase()
      ? pair.reserve0
      : pair.reserve1;
    const quoteReserve = pair.token0.address.toLowerCase() === wethAddress.toLowerCase()
      ? pair.reserve1
      : pair.reserve0;

    const priceUsd = formatUnits(
      (BigInt(quoteReserve.quotient.toString()) * BigInt(10 ** 18)) / BigInt(wethReserve.quotient.toString()),
      18,
    );

    return { price: priceUsd, wethAddress, usdcAddress: quoteToken };
  }
}

export type { SwapQuoteParams, SwapQuoteResult, NativeTokenPriceResult } from "./types.js";

