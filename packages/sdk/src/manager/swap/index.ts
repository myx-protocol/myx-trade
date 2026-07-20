import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { Pool, Route as V3Route, FeeAmount } from "@uniswap/v3-sdk";
import { Trade as RouterTrade } from "@uniswap/router-sdk";
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS, UniversalRouterVersion } from "@uniswap/universal-router-sdk";
import { getPublicClient } from "@/web3/viemClients.js";
import type { SwapQuoteParams, SwapQuoteResult, NativeTokenPriceResult } from "./types.js";
import { parseUnits, formatUnits } from "viem";

const POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const FACTORY_ABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    name: "getPool",
    outputs: [{ name: "pool", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const UNISWAP_V3_FACTORY: Record<number, `0x${string}`> = {
  1: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  42161: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  59144: "0x31FAfd4889FA1269F7a13A66eE0fB458f27D72A9",
  56: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
  97: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  421614: "0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e",
  4663: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
};

// WETH/WBNB address per chain (used for price quoting)
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

// USDC/quote token address per chain
const USDC_ADDRESS: Record<number, `0x${string}`> = {
  1:      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  42161:  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  421614: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  59144:  "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  59141:  "0x9C452Ef0e7b158F81A0e00a81aaea8ae04132cBc",
  56:     "0x55d398326f99059fF775485246999027B3197955",
  97:     "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  4663:   "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
};

// Chains that only have UniversalRouter V2_1_1 deployed (not V2_0)
const CHAIN_ROUTER_VERSION: Record<number, UniversalRouterVersion> = {
  4663: UniversalRouterVersion.V2_1_1,
};

function getRouterVersion(chainId: number): UniversalRouterVersion {
  return CHAIN_ROUTER_VERSION[chainId] ?? UniversalRouterVersion.V2_0;
}

const FEE_TIERS = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];

async function findBestPool(
  publicClient: ReturnType<typeof getPublicClient>,
  factoryAddress: `0x${string}`,
  tokenA: Token,
  tokenB: Token,
): Promise<Pool> {
  const poolResults = await Promise.all(
    FEE_TIERS.map(async (fee) => {
      try {
        const poolAddress = await publicClient.readContract({
          address: factoryAddress,
          abi: FACTORY_ABI,
          functionName: "getPool",
          args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, fee],
        });

        if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
          return null;
        }

        const [slot0, liquidity] = await Promise.all([
          publicClient.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "slot0" }),
          publicClient.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "liquidity" }),
        ]);

        if (slot0[0] === 0n) return null;

        return new Pool(tokenA, tokenB, fee, slot0[0].toString(), liquidity.toString(), slot0[1]);
      } catch {
        return null;
      }
    }),
  );

  const valid = poolResults.filter((p): p is Pool => p !== null);
  if (valid.length === 0) {
    throw new Error(
      `No Uniswap V3 pool found for ${tokenA.symbol}/${tokenB.symbol} on chainId ${tokenA.chainId}`,
    );
  }

  return valid.reduce((best, pool) =>
    BigInt(pool.liquidity.toString()) > BigInt(best.liquidity.toString()) ? pool : best,
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

    const factoryAddress = UNISWAP_V3_FACTORY[chainId];
    if (!factoryAddress) {
      throw new Error(`Uniswap V3 factory not configured for chainId ${chainId}`);
    }

    const sdkTokenIn = new Token(chainId, tokenIn, tokenInDecimals, tokenInSymbol);
    const sdkTokenOut = new Token(chainId, tokenOut, tokenOutDecimals, tokenOutSymbol);

    const publicClient = getPublicClient(chainId);
    const bestPool = await findBestPool(publicClient, factoryAddress, sdkTokenIn, sdkTokenOut);

    const amountInRaw = parseUnits(amountIn, tokenInDecimals);
    const currencyAmountIn = CurrencyAmount.fromRawAmount(sdkTokenIn, amountInRaw.toString());

    const v3Route = new V3Route([bestPool], sdkTokenIn, sdkTokenOut);
    const [outputAmount] = await bestPool.getOutputAmount(currencyAmountIn);

    const slippagePercent = new Percent(Math.floor(slippageTolerance * 10000), 10000);
    const amountOutMinFraction = outputAmount.asFraction.multiply(
      new Percent(10000 - Math.floor(slippageTolerance * 10000), 10000),
    );
    const amountOutMin = CurrencyAmount.fromFractionalAmount(
      sdkTokenOut,
      amountOutMinFraction.numerator,
      amountOutMinFraction.denominator,
    );

    const routerTrade = new RouterTrade({
      v3Routes: [
        {
          routev3: v3Route,
          inputAmount: currencyAmountIn,
          outputAmount,
        },
      ],
      tradeType: TradeType.EXACT_INPUT,
    });

    const universalRouterAddress = UNIVERSAL_ROUTER_ADDRESS(getRouterVersion(chainId), chainId) as `0x${string}`;
    const deadline = Math.floor(Date.now() / 1000) + 1800;

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
      feeTier: bestPool.fee,
      swapData: calldata as `0x${string}`,
      swapTarget: universalRouterAddress,
      paymentAmount: amountInRaw.toString(),
      paymentToken: paymentToken ?? tokenIn,
      minQuoteOut: parseUnits(amountOutMinFixed, tokenOutDecimals).toString(),
    };
  }

  async getNativeTokenPrice(chainId: number): Promise<NativeTokenPriceResult> {
    const wethAddress = WETH_ADDRESS[chainId];
    const usdcAddress = USDC_ADDRESS[chainId];
    const factoryAddress = UNISWAP_V3_FACTORY[chainId];

    if (!wethAddress) throw new Error(`WETH address not configured for chainId ${chainId}`);
    if (!usdcAddress) throw new Error(`USDC address not configured for chainId ${chainId}`);
    if (!factoryAddress) throw new Error(`Uniswap V3 factory not configured for chainId ${chainId}`);

    const wethToken = new Token(chainId, wethAddress, 18, "WETH");
    const usdcToken = new Token(chainId, usdcAddress, 6, "USDC");

    const publicClient = getPublicClient(chainId);
    const pool = await findBestPool(publicClient, factoryAddress, wethToken, usdcToken);

    // derive price from sqrtPriceX96: price = (sqrtPriceX96 / 2^96)^2, adjusted for decimals
    const sqrtPriceX96 = BigInt(pool.sqrtRatioX96.toString());
    const Q96 = BigInt(2) ** BigInt(96);
    const priceRaw = (sqrtPriceX96 * sqrtPriceX96 * BigInt(10 ** 18)) / (Q96 * Q96);

    // pool token ordering: if WETH < USDC by address, price = USDC per WETH; else invert
    let priceUsd: string;
    if (wethToken.sortsBefore(usdcToken)) {
      // price = priceRaw / 10^18 * 10^(18-6) = priceRaw / 10^6
      priceUsd = formatUnits(priceRaw, 6);
    } else {
      // inverted: price = 10^24 / priceRaw
      const inverted = priceRaw > 0n ? (BigInt(10 ** 24)) / priceRaw : 0n;
      priceUsd = formatUnits(inverted, 6);
    }

    return {
      price: priceUsd,
      wethAddress,
      usdcAddress,
    };
  }
}

export type { SwapQuoteParams, SwapQuoteResult, NativeTokenPriceResult } from "./types.js";
