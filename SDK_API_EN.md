# MYX Trade SDK — Full API Reference

> Version: see `version` in `package.json`; read `SDK_VERSION` at runtime.
>
> **Data source tags**: `[On-chain]` blockchain node RPC | `[Backend]` MYX HTTP gateway | `[WS]` WebSocket | `[Mixed]` both | `[Local]` no network

---

## Table of Contents

1. [Initialization & Authentication](#1-initialization--authentication)
2. [Order Module](#2-order-module)
3. [Position Module](#3-position-module)
4. [Account Module](#4-account-module)
5. [Markets Module](#5-markets-module)
6. [Utils Module](#6-utils-module)
7. [Seamless (Gasless) Module](#7-seamless-gasless-module)
8. [LP Module](#8-lp-module)
9. [Subscription (WebSocket)](#9-subscription-websocket)
10. [Appeal Module](#10-appeal-module)
11. [Referrals Module](#11-referrals-module)
12. [Appendix](#12-appendix)

---

## 1. Initialization & Authentication

SDK initialization and authentication entry point. Provides network configuration, wallet signer attachment, and AccessToken generation and refresh methods for authenticated backend requests.

### Installation

```bash
pnpm add @myx-trade/sdk
```

### MyxClientConfig

SDK instance configuration type. Specifies the gateway connection, Broker binding, and the identity signing delegate for secure AccessToken generation.

```typescript
interface MyxClientConfig {
  chainId: number;              // Chain ID (testnet: 421614)
  brokerAddress: string;        // Broker contract address — get from MYX team
  signer?: ISigner;             // ethers v5/v6 Signer; either this or walletClient
  walletClient?: WalletClient;  // viem WalletClient — recommended (smaller bundle)
  isTestnet?: boolean;          // Testnet mode (default: false)
  isBetaMode?: boolean;         // Beta environment (default: false)
  seamlessMode?: boolean;       // Gasless mode (default: false)
  poolingInterval?: number;     // Internal polling interval (ms)
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none'; // default: 'info'
  socketConfig?: {
    reconnectInterval?: number;    // WS reconnect interval (ms, default: 5000)
    maxReconnectAttempts?: number; // Max reconnect attempts (default: 5)
  };
  getAccessToken?: () => Promise<{
    code: number;
    msg: string | null;
    data: {
      accessToken: string;
      expireAt: number;      // Unix timestamp in seconds
      allowAccount?: string;
      appId?: string;
    };
  }>;
}
```

### Create Instance

```typescript
import { MyxClient } from '@myx-trade/sdk';

const myxClient = new MyxClient({
  chainId: 421614,
  walletClient,           // from wagmi useWalletClient()
  brokerAddress: BROKER_ADDRESS,
  isTestnet: true,
});
```

### ISigner / SignerLike

```typescript
interface ISigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
  signTypedData?(...): Promise<string>; // EIP-712, optional
}

type SignerLike = ISigner | ethers.Signer;
```

### myxClient.auth `[Local/Backend]`

Bind a wallet and AccessToken callback; must be called before any SDK operation.

> Must be called after creating the instance to bind wallet and token.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| signer | `SignerLike` (optional) | ethers v5/v6 Signer or compatible |
| walletClient | `WalletClient` (optional) | viem WalletClient |
| getAccessToken | `() => Promise<AccessTokenResponse>` (optional) | Callback that returns a fresh AccessToken |

**getAccessToken implementation example:**

```typescript
import { SHA256, Hex } from 'crypto-es';

const getAccessToken = async () => {
  const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
  const signature = SHA256(payload).toString(Hex);
  const res = await fetch(
    `https://api-beta.myx.finance/openapi/gateway/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`
  );
  return res.json(); // { code, msg, data: { accessToken, expireAt } }
};
```

### myxClient.updateClientChainId `[Local]`

Switch the active chain; call this when switching networks in a multi-chain setup.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | New chain ID to switch to |
| brokerAddress | `string` | Broker contract address on the new chain |

### myxClient.getAccessToken `[Local]`

Read the currently cached login token from memory.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Promise<string \| null>` | Cached access token, or null if not set |

### myxClient.refreshAccessToken `[Backend]`

Refresh the login token; call when a 9401 error occurs.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| forceRefresh | `boolean` (optional) | If true, always refreshes; otherwise refreshes only when expired |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Promise<string \| null>` | New access token, or null on failure |

### myxClient.close `[WS]`

Shut down the SDK, disconnect WebSocket, and clean up internal state.

---

## 2. Order Module

Order functionality wrapper for **TradingRouter** interactions. Provides methods for opening, closing, increasing/decreasing positions, and conditional orders (limit/TP/SL), as well as querying open orders and history.

### Enums

```typescript
// Order type
const OrderType = {
  MARKET: 0,
  LIMIT: 1,
  STOP: 2,
  CONDITIONAL: 3,
} as const;
type OrderType = (typeof OrderType)[keyof typeof OrderType];

// Trigger direction
const TriggerType = {
  NONE: 0, // No trigger
  GTE: 1,  // >= trigger (take profit)
  LTE: 2,  // <= trigger (stop loss)
} as const;
type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

// Operation type
const OperationType = {
  INCREASE: 0, // Open / increase position
  DECREASE: 1, // Close / decrease position
} as const;
type OperationType = (typeof OperationType)[keyof typeof OperationType];

// Direction
const Direction = {
  LONG: 0,
  SHORT: 1,
} as const;
type Direction = (typeof Direction)[keyof typeof Direction];

// Time in force
const TimeInForce = {
  IOC: 0, // Immediate Or Cancel
} as const;
type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];
```

### PlaceOrderParams

Parameter bundle for placing or queuing orders. Contains direction, leverage, slippage range, and optional attached TP/SL exit orders.

```typescript
interface PlaceOrderParams {
  chainId: number;
  address: `0x${string}`;     // User EOA address
  poolId: string;              // Pool address
  positionId: string;          // '' for new position; existing ID for add/close
  orderType: OrderType;
  triggerType: TriggerType;
  direction: Direction;
  collateralAmount: string;    // Collateral in quote token decimals (e.g. USDC: 6)
  size: string;                // Position size (18 decimals)
  price: string;               // Price (30 decimals)
  timeInForce: TimeInForce;
  postOnly: boolean;           // Maker-only flag
  slippagePct: string;         // Slippage in bps (100 = 1%)
  executionFeeToken: string;   // Execution fee token address (usually USDC)
  leverage: number;
  tpSize?: string;             // Take-profit size (18 decimals)
  tpPrice?: string;            // Take-profit price (30 decimals)
  slSize?: string;             // Stop-loss size (18 decimals)
  slPrice?: string;            // Stop-loss price (30 decimals)
}
```

### PositionTpSlOrderParams

Parameters for overriding or adding a TP/SL exit strategy to an existing position. Sending this payload does not re-open or re-allocate position size.

```typescript
interface PositionTpSlOrderParams {
  chainId: number;
  address: `0x${string}`;
  poolId: string;
  positionId: string;          // Existing position ID
  executionFeeToken: string;
  tpTriggerType: TriggerType;  // GTE
  slTriggerType: TriggerType;  // LTE
  direction: Direction;
  leverage: number;
  slippagePct?: string;        // bps
  tpSize?: string;
  tpPrice?: string;            // 30 decimals
  slSize?: string;
  slPrice?: string;            // 30 decimals
}
```

### UpdateOrderParams

Modification request for an order that has not yet been matched. Supports updating price and size before the trigger condition is reached.

```typescript
interface UpdateOrderParams {
  orderId: string;
  size: string;
  price: string;               // 30 decimals
  tpSize: string;
  tpPrice: string;             // 30 decimals
  slSize: string;
  slPrice: string;             // 30 decimals
  useOrderCollateral: boolean;
  executionFeeToken: string;
}
```

### GetHistoryOrdersParams

Parameter bundle for paginated historical order/position queries. Defines the pool scope and page number to retrieve.

```typescript
interface GetHistoryOrdersParams {
  chainId: number;
  poolId?: string;  // Optional pool filter
  page?: number;
  limit: number;
}
```

---

### Margin / networkFee / Deposit — Business Rules

#### Formulas

**Open (no existing position, `positionId` is empty):**

```
totalMargin = collateral
            + networkFee(open)
            + networkFee(TP, if set)
            + networkFee(SL, if set)
            + networkFee(liquidation reserve)   ← omitted when adding to a position
            + tradingFee
```

**Increase (existing position, `positionId` non-empty):**

```
totalMargin = collateral + networkFee(open) + networkFee(TP) + networkFee(SL) + tradingFee
```

**Partial close:**

```
totalMargin = networkFee(close) + Δ (top-up when remaining margin cannot cover the close fee)
```

**Full close:** `totalMargin = 0` — `closeAllPositions` internally uses deposit `'0'`

**Deposit (top-up from wallet):** `max(0, totalMargin − availableMargin)`

#### Calculation Code

```typescript
// ─── 1. Get per-leg execution fee ────────────────────────────────
const singleNetworkFee = await myxClient.utils.getNetworkFee(marketId, chainId);
// Returns string (wei), e.g. "500000"

// ─── 2. Accumulate networkFee by scenario ────────────────────────
// New position (includes liquidation-reserve leg)
const networkFeeTotal = (
  BigInt(singleNetworkFee)                              // open leg
  + (hasTp ? BigInt(singleNetworkFee) : 0n)            // TP leg (if set)
  + (hasSl ? BigInt(singleNetworkFee) : 0n)            // SL leg (if set)
  + BigInt(singleNetworkFee)                            // liquidation reserve (new position only)
).toString();
// For add-to-position: remove the last liquidation-reserve term

// ─── 3. Calculate tradingFee ──────────────────────────────────────
const feeRate = await myxClient.utils.getUserTradingFeeRate(assetClass, riskTier, chainId);
// feeRate.data: { takerFeeRate, makerFeeRate, baseTakerFeeRate, baseMakerFeeRate }
// takerFeeRate unit: 1e6 (e.g. 1000 = 0.1%)

// tradingFee = size × price × takerFeeRate / 1e18 / 1e30 / 1e6
// size: 18-decimal, price: 30-decimal, takerFeeRate: 1e6
const tradingFee =
  (BigInt(size) * BigInt(price) * BigInt(feeRate.data.takerFeeRate))
  / BigInt(1e18)   // cancel size decimals
  / BigInt(1e30)   // cancel price decimals
  / BigInt(1e6);   // cancel feeRate decimals
// Result is in the same unit as collateralAmount (quote token decimals)

// ─── 4. Total margin required ────────────────────────────────────
const totalMarginRequired =
  BigInt(collateralAmount) + BigInt(networkFeeTotal) + tradingFee;

// ─── 5. Get available margin ─────────────────────────────────────
const marginResult = await myxClient.account.getAvailableMarginBalance({
  poolId,
  chainId,
  address: userAddress,
});
const availableMargin = marginResult.data; // bigint

// ─── 6. Compute deposit amount ───────────────────────────────────
const depositAmount =
  totalMarginRequired > availableMargin
    ? (totalMarginRequired - availableMargin).toString()
    : '0';

// ─── 7. Place the order ──────────────────────────────────────────
// Pass only the execution fee total as networkFee — NOT tradingFee
const result = await myxClient.order.createIncreaseOrder(
  {
    chainId,
    address: userAddress,
    poolId,
    positionId: '',          // new position
    orderType: OrderType.MARKET,
    triggerType: TriggerType.NONE,
    direction: Direction.LONG,
    collateralAmount,        // string, quote token decimals
    size,                    // string, 18 decimals
    price,                   // string, 30 decimals
    timeInForce: TimeInForce.IOC,
    postOnly: false,
    slippagePct: '100',      // 1%
    executionFeeToken: quoteTokenAddress,
    leverage: 10,
  },
  networkFeeTotal,           // string: aggregated execution fee only, no tradingFee
);
```

> **Note**: `tradingFee` is **not** passed as the second argument to `createIncreaseOrder`. The SDK internally computes `needAmount = BigInt(collateralAmount) + BigInt(networkFee)` and compares it against `getAvailableMarginBalance` to determine `depositAmount`. The `tradingFee` is deducted by the contract at execution time. For more accurate UI display of the deposit amount, you may include `tradingFee` in `totalMarginRequired` in step 6.

---

### order.createIncreaseOrder `[On-chain]`

Open a new position or add to an existing one.

> Pre-checks: on-chain allowance / balance / available margin

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `PlaceOrderParams` | Order parameters (see PlaceOrderParams interface) |
| networkFee | `string` | Aggregated execution fee string (wei) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data.transactionHash | `string` (optional) | On-chain transaction hash |
| data.receipt | `TransactionReceipt` (optional) | On-chain transaction receipt |
| data.orderId | `string` (optional) | Placed order ID parsed from receipt |
| message | `string` (optional) | Error message if code != 0 |

### order.createDecreaseOrder `[On-chain]`

Close or reduce an existing position.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `PlaceOrderParams` | Order parameters (see PlaceOrderParams interface) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data.transactionHash | `string` (optional) | On-chain transaction hash |
| data.receipt | `TransactionReceipt` (optional) | On-chain transaction receipt |
| data.orderId | `string` (optional) | Placed order ID parsed from receipt |
| message | `string` (optional) | Error message if code != 0 |

### order.closeAllPositions `[On-chain]`

Close all open positions at once.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| paramsArray | `PlaceOrderParams[]` | Array of decrease-order params, one per position to close |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Array<{ code, data?, message? }>` | Array of results, one per position |

### order.createPositionTpSlOrder `[On-chain]`

Add take-profit and stop-loss orders to an existing position.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `PositionTpSlOrderParams` | TP/SL order parameters (see PositionTpSlOrderParams interface) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data.transactionHash | `string` (optional) | On-chain transaction hash |
| data.receipt | `TransactionReceipt` (optional) | On-chain transaction receipt |
| data.orderId | `string` (optional) | Placed order ID parsed from receipt |
| message | `string` (optional) | Error message if code != 0 |

### order.updateOrderTpSl `[On-chain]`

Modify the TP/SL price and size on an existing open order.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `UpdateOrderParams` | Updated order fields (see UpdateOrderParams interface) |
| quoteAddress | `string` | Quote token contract address |
| chainId | `number` | Chain ID |
| address | `` `0x${string}` `` | Caller wallet address |
| marketId | `string` | Market ID for the order |
| isTpSlOrder | `boolean` (optional) | True if this is a standalone TP/SL order |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data.transactionHash | `string` (optional) | On-chain transaction hash |
| data.receipt | `TransactionReceipt` (optional) | On-chain transaction receipt |
| data.orderId | `string` (optional) | Updated order ID |
| message | `string` (optional) | Error message if code != 0 |

### order.cancelOrder `[On-chain]`

Cancel a single open order.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| orderId | `string` | ID of the order to cancel |
| chainId | `number` | Chain ID |

### order.cancelOrders `[On-chain]`

Cancel multiple open orders in one call.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| orderIds | `string[]` | Array of order IDs to cancel |
| chainId | `number` | Chain ID |

### order.cancelAllOrders `[On-chain]`

Cancel all orders in the provided ID list.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| orderIds | `string[]` | Full list of open order IDs to cancel |
| chainId | `number` | Chain ID |

### order.getOrders `[Backend]`

Fetch all currently open (unfilled) orders for the account.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `Order[]` | List of open orders |

### order.getOrderHistory `[Backend]`

Fetch historical filled or cancelled orders.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `GetHistoryOrdersParams` | Pagination and filter options |
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `Order[]` | List of historical orders |

---

## 3. Position Module

Manages and renders user position data. Also supports adjusting collateral on existing positions without reopening them.

### OracleType

Oracle source type for price feed selection. Use to specify the correct on-chain oracle query channel (e.g. Chainlink or Pyth).

```typescript
enum OracleType {
  Chainlink = 1,
  Pyth = 2,
}
```

### position.listPositions `[Backend]`

Fetch all currently open positions for the account.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | `` `0x${string}` `` | Wallet address to query |
| positionId | `string` (optional) | Pass to fetch a single specific position |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `Position[]` | List of open positions |

### position.getPositionHistory `[Backend]`

Fetch historical closed-position records.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | `GetHistoryOrdersParams` | Pagination and optional pool filter |
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `Position[]` | List of closed position records |

### position.adjustCollateral `[Mixed]`

Add or remove collateral from an existing position.

> Oracle price `[Backend]`; margin availability `[On-chain]` + dispute status `[Backend]`; tx `[On-chain]`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| positionId | `string` | ID of the position to adjust |
| adjustAmount | `string` | Positive = add collateral, negative = remove (quote token decimals) |
| quoteToken | `string` | Quote token contract address |
| poolOracleType | `OracleType` | Oracle type for the pool |
| chainId | `number` | Chain ID |
| address | `` `0x${string}` `` | Caller wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data.hash | `string` (optional) | On-chain transaction hash |
| message | `string` (optional) | Error message if code != 0 |

---

## 4. Account Module

Unified account management layer. Users must deposit funds through this module before executing contract trades (isolated QUOTE-margined accounts). Also provides VIP tier display logic.

### AccountInfo

Aggregated account asset summary for a given pool. Includes Free Margin (available usable assets) and current total Unrealized PnL.

```typescript
interface AccountInfo {
  freeMargin: string;    // Available margin
  quoteProfit: string;   // Unrealized PnL
  // ...additional on-chain fields
}
```

### account.getAvailableMarginBalance `[Mixed]`

Check how much margin is available for new orders in a given pool.

> `getAccountInfo [On-chain]` + `appeal.getAppealStatus [Backend]`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `bigint` | Available margin in wei |

### account.deposit `[On-chain]`

Top up the trading account with USDC from the wallet.

> May execute an on-chain `approve` first

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| amount | `string` | Deposit amount in quote token decimals |
| tokenAddress | `string` | Quote token contract address |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `TransactionReceipt` | On-chain transaction receipt |

### account.updateAndWithdraw `[On-chain]`

Withdraw funds from the trading account to a wallet address.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| receiver | `string` | Recipient wallet address |
| poolId | `string` | Pool address |
| isQuoteToken | `boolean` | True = withdraw quote token; false = base token |
| amount | `string` | Amount to withdraw |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `TransactionReceipt` | On-chain transaction receipt |

### account.getAccountInfo `[On-chain]`

Get detailed account info for a pool (free margin, unrealized PnL, etc.).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| address | `` `0x${string}` `` | Wallet address to query |
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `AccountInfo` | Account details including freeMargin and quoteProfit |

### account.getAccountVipInfo `[On-chain]`

Check the account's VIP tier and fee-rate configuration.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| tier | `number` | VIP tier level |
| referrer | `string` | Referrer address |
| totalReferralRebatePct | `number` | Total referral rebate percentage |
| referrerRebatePct | `number` | Referrer's share of the rebate |
| nonce | `number` | Current nonce for fee data signing |
| deadline | `number` | Signature deadline timestamp |

### account.getCurrentFeeDataEpoch `[On-chain]`

Get the current fee-data epoch number.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Current fee data epoch number |

### account.setUserFeeData `[On-chain]`

Apply a backend EIP-712 signed VIP fee tier and referral configuration to the account on-chain; the contract verifies that epoch and nonce match strictly and the deadline has not expired, ensuring replay protection.

> Underlying contract: `Broker.setUserFeeData`
> On-chain verification order: ① epoch matches current era → ② signer is in the authorized set → ③ deadline not expired → ④ nonce == userNonce + 1

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | `` `0x${string}` `` | User wallet address |
| chainId | `number` | Chain ID |
| deadline | `number` | Signature expiry Unix timestamp |
| feeData.tier | `number` | VIP fee tier (0 = default) |
| feeData.referrer | `string` | Referrer address (zero address if no referrer) |
| feeData.totalReferralRebatePct | `number` | Total referral rebate percentage (precision 1e8; 100_000_000 = 100%) |
| feeData.referrerRebatePct | `number` | Referrer's share of rebate (≤ totalReferralRebatePct) |
| feeData.nonce | `number` | Must equal on-chain userNonce + 1 |
| signature | `string` | Backend-issued EIP-712 signature from the authorized signer |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `TransactionReceipt` | On-chain transaction receipt |

### account.getTradeFlow `[Backend]`

Fetch the account's fund-flow history (deposits, withdrawals, fee deductions).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| limit | `number` | Maximum number of records to return |
| poolId | `string` (optional) | Filter by pool address |
| address | `` `0x${string}` `` | Wallet address to query |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `TradeFlow[]` | List of trade flow records |

---

## 5. Markets Module

Provides static constants and market data queries. Covers funding rates, spread state, configuration baselines, and depth — used to assist with order panel rendering.

### KlineResolution

Chart granularity level used when fetching snapshots or aligning WebSocket streams (e.g. 5s, 1m, 1h).

```typescript
type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
```

### markets.getPoolLevelConfig `[Backend]`

Get the pool's leverage-tier and collateral requirements.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Pool level config object | Leverage tiers and collateral requirements |

### markets.getKlineList `[Backend]`

Fetch historical candlestick (K-line) data.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |
| interval | `KlineResolution` | Candle interval (e.g. `'1m'`, `'1h'`) |
| limit | `number` | Number of bars to return |
| endTime | `number` (optional) | End time as ms timestamp; defaults to now |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `KlineBar[]` | Array of OHLCV candle bars |

### markets.getKlineLatestBar `[Backend]`

Fetch the most recent candle bar for real-time chart updates.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |
| interval | `KlineResolution` | Candle interval |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `KlineBar` | Single most-recent candle bar |

### markets.getTickerList `[Backend]`

Get a real-time market snapshot for multiple pools (price, change %, volume).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolIds | `string[]` | List of pool addresses to fetch tickers for |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Ticker[]` | Array of market ticker snapshots |

### markets.searchMarket `[Backend]`

Search markets by keyword without authentication.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| keyword | `string` | Search keyword (e.g. token name or symbol) |
| limit | `number` (optional) | Maximum number of results |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Market[]` | Matching market list |

### markets.searchMarketAuth `[Backend]`

Search markets by keyword; result includes the user's favorites status (requires login).

> Requires token; result includes favorites status

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| keyword | `string` | Search keyword |
| limit | `number` (optional) | Maximum number of results |
| address | `` `0x${string}` `` | Authenticated wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Market[]` | Matching market list with `isFavorite` field |

### markets.getFavoritesList `[Backend]`

Get the user's list of favorited markets.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| page | `number` (optional) | Page number for pagination |
| limit | `number` | Maximum number of records per page |
| address | `` `0x${string}` `` | Authenticated wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Market[]` | List of favorited markets |

### markets.addFavorite / removeFavorite `[Backend]`

Add or remove a market from the user's favorites.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address to add or remove |
| address | `` `0x${string}` `` | Authenticated wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data / message | `any` | Result data or error message |

### markets.getBaseDetail `[Backend]`

Get base-token details such as name, address, and decimals.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| baseAddress | `string` | Base token contract address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Base token detail object | Token name, address, decimals, and metadata |

### markets.getMarketDetail `[Backend]`

Get full market details including price, fee rates, and liquidity.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Market detail object | Price, fee rates, liquidity, and market metadata |

### markets.getPoolSymbolAll `[Backend]`

Get a global map of all pool IDs to their trading-pair symbols.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Record<string, string>` | Map of poolId to trading-pair symbol |

### markets.getPoolFundingFeeInfo `[On-chain]`

Query the funding rate info for a pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |
| marketPrice | `string` | Current market price (30 decimals) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data / message | `any` | On-chain pool info shape including funding rate, or error message |

---

## 6. Utils Module

Stateless utility helpers used throughout the SDK. Covers token allowance checks, taker/maker fee-rate lookups based on the current **Broker** configuration, and network (execution) fee estimation for order submissions.

### utils.needsApproval `[On-chain]`

Check whether the user needs to approve the token before trading.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | `` `0x${string}` `` | Wallet address to check allowance for |
| chainId | `number` | Chain ID |
| tokenAddress | `string` | ERC20 token contract address |
| amount | `string \| bigint` | Amount to check against the current allowance |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `boolean` | True if approval is required before trading |

### utils.approveAuthorization `[On-chain]`

Grant the contract permission to spend the user's tokens (ERC20 approve).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| quoteAddress | `string` | Quote token contract address to approve |
| amount | `string` | Approval amount (typically `ethers.MaxUint256.toString()`) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

### utils.getUserTradingFeeRate `[On-chain]`

Get the user's taker/maker fee rates.

> `Broker.getUserFeeRate`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| assetClass | `number` | Asset class identifier |
| riskTier | `number` | Risk tier of the pool |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| takerFeeRate | `bigint` | Taker fee rate; unit 1e6 (1000 = 0.1%) |
| makerFeeRate | `bigint` | Maker fee rate; unit 1e6 |
| baseTakerFeeRate | `bigint` | Base taker fee rate before add-on; unit 1e6 |
| baseMakerFeeRate | `bigint` | Base maker fee rate before add-on; unit 1e6 |

### utils.getNetworkFee `[On-chain]`

Get the per-leg on-chain execution fee; used to compute the networkFee parameter.

> `MarketManager.getExecutionFee` — returns a single-leg fee

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| marketId | `string` | Market ID to query the fee for |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | Single-leg execution fee in wei |

### utils.getOraclePrice `[Backend]`

Fetch the oracle price and VAA payload for a pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| price | `string` | Oracle price (30 decimals) |
| vaa | `string` | Pyth VAA payload |
| publishTime | `number` | Price publish timestamp |
| poolId | `string` | Pool address (echoed) |
| value | `string` | Oracle fee value |

### utils.buildUpdatePriceParams `[Mixed]`

Build the calldata needed for an on-chain price update.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | updatePrice calldata params | VAA, price, publishTime, and related fields for the on-chain call |

### utils.getLiquidityInfo `[On-chain]`

Query pool liquidity details (asset amounts, total LP supply).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| marketPrice | `string` | Current market price (30 decimals) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Pool liquidity info object | Asset amounts, LP supply, and utilization data |

### utils.checkSeamlessGas `[On-chain]`

Check whether a seamless account has enough balance to cover forwarding fees.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | `` `0x${string}` `` | Seamless wallet address to check |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `boolean` | True if the seamless account has sufficient gas balance |

### utils.getGasPriceByRatio `[On-chain]`

Get the current gas price scaled by the configured ratio.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Gas price in wei scaled by the configured ratio |

### utils.getGasLimitByRatio `[On-chain]`

Scale an estimated gas value to avoid out-of-gas failures.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| estimatedGas | `bigint` | Raw estimated gas from simulation |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Adjusted gas limit with safety ratio applied |

### utils.getOrderIdFromTransaction `[On-chain]`

Parse an order ID from a transaction receipt.

> Parses `OrderPlaced` event from receipt logs

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| receipt | `TransactionReceipt` | Transaction receipt containing event logs |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string \| undefined` | Order ID if the OrderPlaced event was found; undefined otherwise |

### utils.formatErrorMessage `[Local]`

Convert a contract revert or SDK error into a human-readable message.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| error | `unknown` | Raw error from a failed transaction or SDK call |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | Human-readable error message |

---

## 7. Seamless (Gasless) Module

Zero-gas order flow built on the ERC-2771 meta-transaction standard. Users are not required to hold native gas; the module generates a signed authorization that is executed by a remote relayer, significantly reducing the on-chain interaction friction.

### seamless.onCheckRelayer `[On-chain]`

Check whether the seamless address is authorized and the token is approved.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| masterAddress | `` `0x${string}` `` | Master wallet address |
| seamlessAddress | `` `0x${string}` `` | Seamless (relayer) wallet address |
| chainId | `number` | Chain ID |
| quoteTokenAddress | `string` | Quote token contract address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| isRelayer | `boolean` | True if the seamless address is authorized |
| needsApproval | `boolean` | True if token approval is required |

### seamless.authorizeSeamlessAccount `[Mixed]`

Authorize or revoke a seamless wallet for gasless transactions.

> Main entry point — authorize or revoke a seamless account

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| approve | `boolean` | True = authorize; false = revoke |
| seamlessAddress | `string` | Seamless wallet address to authorize or revoke |
| chainId | `number` | Chain ID |
| forwardFeeToken | `string` | Forwarding fee token contract address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `TransactionReceipt` (optional) | On-chain transaction receipt |
| message | `string` (optional) | Error message if code != 0 |

### seamless.getUSDPermitParams `[On-chain]`

Generate EIP-2612 Permit parameters for approve-free forwarder authorization.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| deadline | `number` | Permit expiry as Unix timestamp in seconds |
| chainId | `number` | Chain ID |
| quoteTokenAddress | `string` | Quote token contract address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Permit params object | EIP-2612 permit fields: v, r, s, deadline, and related data |

### seamless.getForwardEip712Domain `[On-chain]`

Get the Forwarder contract's EIP-712 signing domain.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | EIP-712 domain object | Domain name, version, chainId, and verifyingContract |

### seamless.forwarderTx `[Mixed]`

Submit a gasless transaction through the Forwarder contract.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| from | `string` | Sender address (seamless wallet) |
| to | `string` | Target contract address |
| value | `string` | ETH value to forward (usually "0") |
| gas | `string` | Gas limit for the forwarded call |
| deadline | `number` | Forwarded tx expiry timestamp |
| data | `string` | ABI-encoded calldata |
| nonce | `string` | Forwarder nonce |
| forwardFeeToken | `string` | Token used to pay the forwarding fee |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| code | `number` | Status code; 0 = success |
| data | `any` (optional) | Result data from the forwarder |
| message | `string` (optional) | Error message if code != 0 |

### seamless.forwardTxInFront `[Mixed]`

Automatically sign and submit a forwarder transaction (handles signing and polling).

> Sign on behalf + submit (handles signing and polling internally)

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | ForwardRequest fields | Same shape as `forwarderTx` params |
| chainId | `number` | Chain ID |

### seamless.getOriginSeamlessAccount `[On-chain]`

Look up the master account address for a given seamless address.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| seamlessAddress | `string` | Seamless wallet address to look up |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| masterAddress | `string` | Master account address linked to the seamless wallet |

### seamless.formatForwarderTxParams `[On-chain + Local]`

Build a ForwardRequest struct, auto-fetching the current nonce from chain.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| params | ForwardRequest fields | ForwardRequest fields excluding nonce |
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | ForwardRequest | Complete ForwardRequest with on-chain nonce populated |

---

## 8. LP Module

**Imports:**

```typescript
import { pool, quote, base, market } from '@myx-trade/sdk';

// Decimal constants
import { COMMON_PRICE_DECIMALS, COMMON_LP_AMOUNT_DECIMALS } from '@myx-trade/sdk';
// COMMON_PRICE_DECIMALS = 30
```

### Enums

```typescript
enum MarketPoolState {
  Cook = 0,     // Market created
  Boosted = 1,  // Waiting for TVL threshold
  Primed = 2,   // Fee charged, waiting for oracle
  Trench = 3,   // Trading enabled
  PreBench = 4, // Pending delisting
  Bench = 5,    // Delisted
}

enum PoolType {
  Base = 0,
  Quote = 1,
}
```

---

### pool Namespace

#### CreatePoolRequest

```typescript
interface CreatePoolRequest {
  chainId: number;
  baseToken: string;  // base token address
  marketId: string;
}
```

#### AddTpSLParams

```typescript
interface TpSl {
  amount: number;
  triggerPrice: number;
  triggerType: TriggerType; // TriggerType.GTE (TP) | TriggerType.LTE (SL)
}

interface AddTpSLParams {
  chainId: number;
  poolId: string;
  poolType: PoolType;
  slippage: number;   // decimal, e.g. 0.01 = 1%
  tpsl: TpSl[];
}
```

#### pool.createPool `[On-chain]`

Create a new liquidity pool and bind a base token to a market.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| baseToken | `string` | Base token contract address |
| marketId | `string` | Market ID to bind the pool to |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | New pool ID |

#### pool.getPoolDetail `[Backend]`

Get pool details from the backend (TVL, state, fee rates).

> Indexer-side HTTP — different from `pool.getPoolInfo` (on-chain)

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Pool detail object | TVL, state, fee rates, and other indexer-side metadata |

#### pool.getPoolInfo `[On-chain]`

Get real-time pool data from the chain (asset amounts, LP price).

> `DataProvider.read.getPoolInfo`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| marketPrice | `string` (optional) | Current market price (30 decimals) |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | On-chain pool info object | Asset amounts, LP price, and real-time pool state |

#### pool.getMarketPoolId `[On-chain]`

Look up the pool ID for a given base token and market combination.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| baseToken | `string` | Base token contract address |
| marketId | `string` | Market ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | Pool ID for the given base token and market |

#### pool.getMarketPools `[On-chain]`

Get all pool IDs associated with a market.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| marketId | `string` | Market ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string[]` | List of pool IDs for the market |

#### pool.getUserGenesisShare `[On-chain]`

Get the user's genesis LP share in a pool (early-LP incentive).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| share | `bigint` | User's genesis share amount |

#### pool.addTpSl `[On-chain]`

Set take-profit/stop-loss on an LP position; liquidity is auto-withdrawn on trigger.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| poolType | `PoolType` | Base or Quote pool type |
| slippage | `number` | Slippage tolerance as a decimal (e.g. 0.01 = 1%) |
| tpsl | `TpSl[]` | Array of TP/SL trigger configs |

#### pool.cancelTpSl `[On-chain]`

Cancel an existing TP/SL order on an LP position.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| orderId | `string` | TP/SL order ID to cancel |

#### pool.reprime `[On-chain]`

Re-trigger the priming process for a pool stuck in the Primed state.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address to reprime |

#### pool.getOpenOrders `[Backend]`

Fetch open TP/SL orders for an LP pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `Order[]` | List of open TP/SL orders for the LP pool |

---

### quote Namespace

#### QuoteDepositParams

```typescript
interface QuoteDepositParams {
  chainId: number;
  poolId: string;
  amount: number;      // human-readable amount (not wei)
  slippage: number;    // e.g. 0.01
  tpsl?: Array<{
    triggerPrice: number;
    triggerType: TriggerType;
  }>;
}
```

#### QuoteWithdrawParams

```typescript
interface QuoteWithdrawParams {
  chainId: number;
  poolId: string;
  amount: number;
  slippage: number;
}
```

#### quote.deposit `[On-chain]`

Deposit USDC into the Quote pool to provide liquidity.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| amount | `number` | Human-readable deposit amount (not wei) |
| slippage | `number` | Slippage tolerance as a decimal (e.g. 0.01 = 1%) |
| tpsl | `Array<{ triggerPrice, triggerType }>` (optional) | TP/SL orders to attach to the deposit |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### quote.withdraw `[On-chain]`

Withdraw USDC liquidity from the Quote pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| amount | `number` | Human-readable LP token amount to withdraw |
| slippage | `number` | Slippage tolerance as a decimal |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### quote.transfer `[Mixed]`

Transfer Quote LP tokens to another address.

> Validates via backend `getPoolInfo` then executes on-chain transfer

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| recipient | `string` | Destination address to receive LP tokens |
| amount | `number \| string` | LP token amount to transfer |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### quote.getLpPrice `[Mixed]`

Get the current unit price of the Quote LP token.

> `getPriceData [Backend]` + `QuotePool.getPoolTokenPrice [On-chain]`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | Quote LP token unit price |

#### quote.getRewards `[Mixed]`

Check the pending reward amount in the Quote pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| rewards | `bigint` | Pending reward amount |

#### quote.claimQuotePoolRebate `[On-chain]`

Claim rebate rewards from a single Quote pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address to claim rebate from |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### quote.claimQuotePoolRebates `[On-chain]`

Batch-claim rebate rewards from multiple Quote pools.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolIds | `string[]` | Array of pool addresses to claim rebates from |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### quote.withdrawableLpAmount `[On-chain]`

Check how many Quote LP tokens can currently be withdrawn.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Maximum withdrawable LP token amount |

---

### base Namespace

#### BaseDepositParams

```typescript
interface BaseDepositParams {
  chainId: number;
  poolId: string;
  amount: number;      // human-readable amount
  slippage: number;
  tpsl?: Array<{
    triggerPrice: number;
    triggerType: TriggerType;
  }>;
}
```

#### PreviewWithdrawDataParams

```typescript
interface PreviewWithdrawDataParams {
  chainId: number;
  poolId: string;
  account: string;
  amount: string | number;
}
```

#### base.deposit `[On-chain]`

Deposit base tokens (ETH/BTC etc.) into the Base pool to provide liquidity.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| amount | `number` | Human-readable deposit amount (not wei) |
| slippage | `number` | Slippage tolerance as a decimal (e.g. 0.01 = 1%) |
| tpsl | `Array<{ triggerPrice, triggerType }>` (optional) | TP/SL orders to attach to the deposit |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### base.withdraw `[On-chain]`

Withdraw base-token liquidity from the Base pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| amount | `number` | Human-readable LP token amount to withdraw |
| slippage | `number` | Slippage tolerance as a decimal |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

#### base.previewUserWithdrawData `[Mixed]`

Preview how many base tokens will be received before withdrawing (for UI confirmation).

> Oracle `[Backend]` + BasePool `previewUserWithdrawData [On-chain]`

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |
| amount | `string \| number` | LP token amount to simulate withdrawal for |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| baseAmount | `bigint` | Base token amount receivable |
| lpAmount | `bigint` | LP token amount to be burned |

#### base.getLpPrice `[On-chain]`

Get the current unit price of the Base LP token.

> Pure on-chain — no backend oracle dependency (unlike `quote.getLpPrice`)

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `string` | Base LP token unit price |

#### base.getRewards `[Mixed]`

Check the pending reward amount in the Base pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| rewards | `bigint` | Pending reward amount |

#### base.claimBasePoolRebate `[On-chain]`

Claim rebate rewards from a single Base pool.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address to claim rebate from |

#### base.claimBasePoolRebates `[On-chain]`

Batch-claim rebate rewards from multiple Base pools.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolIds | `string[]` | Array of pool addresses to claim rebates from |

#### base.previewLpAmountOut / previewBaseAmountOut `[On-chain]`

Preview the expected LP or base-token amount for a deposit/withdraw (for UI display).

```typescript
// Preview deposit/withdraw amount for UI display
const lpOut = await base.previewLpAmountOut(params)
const baseOut = await base.previewBaseAmountOut(params)
// Returns: bigint
```

#### base.withdrawableLpAmount `[On-chain]`

Check how many Base LP tokens can currently be withdrawn.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |
| account | `string` | User wallet address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Maximum withdrawable LP token amount |

---

### market Namespace

#### market.getMarket `[On-chain]`

Get market configuration from the chain.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | Market info object | On-chain market configuration |

#### market.getOracleFee `[On-chain]`

Get the fee required to submit an oracle price update.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| chainId | `number` | Chain ID |
| poolId | `string` | Pool address |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `bigint` | Oracle fee in wei |

---

## 9. Subscription (WebSocket)

### Data Types

```typescript
type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

interface TickersDataResponse {
  type: 'ticker';
  globalId: number;
  data: {
    C: string; // Close price
    E: number; // Event time (ms)
    T: string; // Timestamp
    h: string; // High price
    i: string; // Index price
    l: string; // Low price
    p: string; // Price change %
    v: string; // Volume
  };
}

interface KlineDataResponse {
  type: 'candle';
  globalId: number;
  resolution: KlineResolution;
  data: {
    E: number; // Event time
    T: string; // Timestamp
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    o: string; // Open price
    t: number; // Time
    v: string; // Volume
  };
}
```

### Connection Management `[WS]`

Establish, close, or re-establish the WebSocket connection.

```typescript
myxClient.subscription.connect(): void
myxClient.subscription.disconnect(): void
myxClient.subscription.reconnect(): void
myxClient.subscription.isConnected: boolean  // read-only
```

### Event Listeners `[Local]`

```typescript
type SocketEvent = 'open' | 'close' | 'error' | 'reconnecting' | 'maxreconnectattempts';

myxClient.subscription.on(event: SocketEvent, handler: Function): void
myxClient.subscription.off(event: SocketEvent, handler: Function): void
```

### subscription.subscribeTickers `[WS]`

Subscribe to real-time market ticker pushes (price, change %, volume).

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| globalId | `number \| number[]` | Single pool globalId or array of globalIds to subscribe to |
| callback | `(data: TickersDataResponse) => void` | Callback invoked on each ticker update |

> To unsubscribe: `myxClient.subscription.unsubscribeTickers(globalId, callback)`

### subscription.subscribeKline `[WS]`

Subscribe to real-time K-line (candlestick) pushes for a given resolution.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| globalId | `number` | Pool globalId to subscribe to |
| resolution | `KlineResolution` | Candle interval (e.g. `'1m'`, `'1h'`) |
| callback | `(data: KlineDataResponse) => void` | Callback invoked on each candle update |

> To unsubscribe: `myxClient.subscription.unsubscribeKline(globalId, resolution, callback)`

### subscription.auth `[WS]`

Authenticate the WebSocket session; must be called before any private subscription.

> Must be called before any private subscription

```typescript
await myxClient.subscription.auth(): Promise<void>
```

### subscription.subscribeOrder `[WS]`

Subscribe to real-time order status updates (fill / cancel notifications).

> Requires `auth()` first

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| callback | `(data: any) => void` | Callback invoked on order create, fill, or cancel events |

> To unsubscribe: `myxClient.subscription.unsubscribeOrder(callback)`

### subscription.subscribePosition `[WS]`

Subscribe to real-time position updates (open / close / modify notifications).

> Requires `auth()` first

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| callback | `(data: any) => void` | Callback invoked on position open, modify, or close events |

> To unsubscribe: `myxClient.subscription.unsubscribePosition(callback)`

---

## 10. Appeal Module

### On-chain Methods `[Mixed / On-chain]`

| Method | Description |
|--------|-------------|
| `submitAppeal(params)` | Submit a dispute (mixed if oracle involved) |
| `voteForAppeal(params)` | Node vote |
| `claimAppealMargin(params)` | Claim dispute margin |
| `claimReimbursement(params)` | Claim reimbursement |
| `getDisputeConfiguration(chainId)` | Fetch dispute config |
| `submitAppealByVoteNode(params)` | Node-submitted appeal |
| `appealReconsideration(params)` | Request reconsideration |

### HTTP Methods `[Backend]`

| Method | Description |
|--------|-------------|
| `getAppealList(params)` | List disputes |
| `getAppealDetail(appealId)` | Dispute detail |
| `uploadAppealEvidence(params)` | Upload evidence |
| `getAppealReconsiderationList(params)` | Reconsideration list |
| `getAppealStatus(poolId, chainId, address)` | Pool dispute state |
| `getAppealNodeVoteList(params)` | Node vote list |
| `postVoteSignature(params)` | Submit vote signature |

---

## 11. Referrals Module

Core entry point for the referral reward system. Supports linking invite targets, applying fee discounts, and withdrawing accumulated rebate or revenue-share earnings.

### referrals.claimRebate `[On-chain]`

Claim accumulated rebate rewards to the wallet.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| tokenAddress | `string` | Token address to claim the rebate in |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| (return value) | `TransactionReceipt` | On-chain transaction receipt |

---

## 12. Appendix

### Environment URLs

| Condition | Backend Base URL |
|-----------|-----------------|
| `isBetaMode = true` | `https://api-beta.myx.finance` |
| `isTestnet = true` | `https://api-test.myx.cash` |
| Mainnet | `https://api.myx.finance` |

WebSocket URL is selected automatically based on `isBetaMode` / `isTestnet` (see `src/manager/const/socket.ts`).

### Price & Decimal Conventions

| Data | Decimals | Example |
|------|----------|---------|
| Price | 30 | `"3000000000000000000000000000000000"` = $3000 |
| USDC amount | 6 | `"1000000"` = 1 USDC |
| ETH / position size | 18 | `"1000000000000000000"` = 1 ETH |
| Slippage | bps | `"100"` = 1% |

```typescript
import { ethers } from 'ethers';
const price = ethers.parseUnits("3000", 30).toString();
const amount = ethers.parseUnits("100", 6).toString(); // 100 USDC
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `-1` | General error |
| `9401` | AccessToken expired |
| `9403` | Unauthorized |

### Contract Error Codes (On-chain Revert)

When a transaction reverts on-chain, the contract throws one of the standardized errors below. Use `utils.formatErrorMessage(error)` to convert them to human-readable text.

#### Permissions

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `PermissionDenied(address,address)` | `0xe03f6024` | Caller lacks permission on the target contract |
| `NotOrderOwner()` | `0xf6412b5a` | Caller is not the order owner |
| `NotPositionOwner()` | `0x70d645e3` | Caller is not the position owner |
| `NotActiveBroker(address)` | `0x27d08510` | Broker is not active |
| `OnlyRelayer()` | `0x4578ddb8` | Only the relayer may call this function |

#### Orders

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `InvalidOrder(bytes32)` | `0xd8cf2fdb` | Order is invalid or has illegal parameters |
| `OrderExpired(bytes32)` | `0x2e775cae` | Order has expired |
| `OrderNotExist(bytes32)` | `0x3b51fbd2` | Order does not exist |
| `NotReachedPrice(bytes32,uint256,uint256,uint8)` | `0xc1d5fb38` | Trigger price condition not yet met |

#### Positions

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `InvalidPosition(bytes32)` | `0x8ea9158f` | Position is invalid or has illegal parameters |
| `PositionNotHealthy(bytes32,uint256)` | `0xa5afd143` | Margin ratio below maintenance level (liquidatable) |
| `PositionRemainsHealthy(bytes32)` | `0xc53f84e7` | Position is healthy; liquidation not applicable |
| `InsufficientCollateral(bytes32,uint256)` | `0x5646203f` | Insufficient collateral |
| `ExceedMaxLeverage(bytes32)` | `0xb4762117` | Requested leverage exceeds the maximum |

#### Liquidity & Balance

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `InsufficientBalance(address,uint256,uint256)` | `0xdb42144d` | Account balance too low |
| `InsufficientLiquidity(uint256,uint256,uint256)` | `0xd54d0fc4` | Pool liquidity too low |
| `InsufficientOutputAmount()` | `0x42301c23` | Output below minimum — slippage protection triggered |
| `InsufficientSize()` | `0xc6e8248a` | Order or position size too small |

#### Price & Oracle

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `StalePrice()` | `0x19abf40e` | Price data is stale |
| `InvalidPrice()` | `0x00bfc921` | Price is invalid or zero |
| `ExceedMaxPriceDeviation()` | `0xfd0f789d` | Price deviation exceeds the allowed maximum |

#### Market & Pool

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `PoolNotExist(bytes32)` | `0x51aeee6c` | Pool does not exist |
| `PoolNotActive(bytes32)` | `0xba01b06f` | Pool is not active; trading unavailable |
| `MarketNotExist(bytes32)` | `0x24e219c7` | Market does not exist |

#### Other

| Error Signature | Selector | Description |
|----------------|----------|-------------|
| `InvalidParameter()` | `0x613970e0` | Invalid parameter |
| `TransferFailed()` | `0x90b8ec18` | Token transfer failed |
| `NoRebateToClaim()` | `0x80577032` | No rebate available to claim |

### Type File Locations

| File | Contents |
|------|----------|
| `src/types/trading.ts` | `PlaceOrderParams`, trading enums |
| `src/types/order.ts` | Order update types |
| `src/api/type.ts` | HTTP response envelopes and DTOs |
| `src/manager/error/const.ts` | SDK error codes |
| `lp/pool/type.ts` | LP pool types |
