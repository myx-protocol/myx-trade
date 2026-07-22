export interface SwapQuoteParams {
  chainId: number;
  tokenIn: `0x${string}`;
  tokenInDecimals: number;
  tokenInSymbol: string;
  tokenOut: `0x${string}`;
  tokenOutDecimals: number;
  tokenOutSymbol: string;
  /** Amount of tokenIn in human-readable units (e.g. "0.5") */
  amountIn: string;
  /**
   * Override the paymentToken in the result (e.g. pass native ETH 0x000...000
   * when the contract accepts native ETH directly, while tokenIn is WETH for quoting).
   * Defaults to tokenIn address if not set.
   */
  paymentToken?: `0x${string}`;
  /** Slippage tolerance as a fraction 0–1, e.g. 0.005 for 0.5% */
  slippageTolerance?: number;
  recipient?: `0x${string}`;
}

export interface SwapQuoteResult {
  /** Expected output amount in human-readable units */
  amountOut: string;
  /** amountOut adjusted for slippage (minimum guaranteed) in human-readable units */
  amountOutMin: string;
  /** Exchange rate: 1 tokenIn = X tokenOut */
  exchangeRate: string;
  /** Pool fee tier used, e.g. 500 = 0.05% */
  feeTier: number;
  /** The encoded swap calldata for TradingRouter.swapAndPlaceOrder */
  swapData: `0x${string}`;
  /** The swap target contract address (Uniswap Universal Router) */
  swapTarget: `0x${string}`;
  /** amountIn in raw token units (wei) */
  paymentAmount: string;
  /** The actual payment token address (may differ from tokenIn when using native ETH) */
  paymentToken: `0x${string}`;
  /** Minimum output amount in raw token units (wei) */
  minQuoteOut: string;
}

export interface NativeTokenPriceResult {
  /** Native token price in USD (e.g. "3500.12") */
  price: string;
  /** WETH/WBNB address used for quoting */
  wethAddress: `0x${string}`;
  /** USDC address used for quoting */
  usdcAddress: `0x${string}`;
}
