# MYX Trade SDK — Full API Reference (English)

This document describes the public surface of `@myx-trade/sdk` and `@myx-trade/sdk/lp`, including **method summaries, parameter and return highlights**, and **where data comes from** (on-chain / backend HTTP / WebSocket / mixed).

**Version**: Use the `version` field in `package.json`; at runtime, read the exported `SDK_VERSION`.

**Related docs**: `SDK_INTEGRATION_GUIDE_EN.md` in the same folder focuses on integration flow and examples; this document focuses on the **API catalog and data flow**. Chinese full API reference: `SDK_API_REFERENCE_FULL_ZH.md`.

---

## Table of contents

1. [Package entry points](#1-package-entry-points)
2. [Data source legend](#2-data-source-legend)
3. [Important concepts](#3-important-concepts)
4. [Install and initialization](#4-install-and-initialization)
5. [MyxClient](#5-myxclient)
6. [Root package exports](#6-root-package-exports)
7. [Subpath `@myx-trade/sdk/lp`](#7-subpath-myx-tradesdklp)
8. [Appendix](#8-appendix)

---

## 1. Package entry points

| Entry | Description |
|--------|-------------|
| `@myx-trade/sdk` | Main package: `MyxClient`, HTTP helpers, `common`, `web3`, `signer`, `types`, re-exports for LP, etc. |
| `@myx-trade/sdk/lp` | LP-only submodules (`base` / `quote` / `pool` / `market` namespaces) for tree-shaking-friendly imports |

The `exports` field in `package.json` maps `"."` and `"./lp"` to `types` / `import` / `require`.

---

## 2. Data source legend

| Tag | Meaning |
|-----|---------|
| **On-chain** | Via blockchain node RPC: contract `read`/`write`, `getGasPrice`, `getBlock`, `waitForTransactionReceipt`, parsing `receipt.logs`, etc. |
| **Backend** | HTTP to MYX gateways (`openapi/gateway`, `v2/agent`, etc.); see `src/api/request.ts` |
| **WebSocket** | Real-time gateway configured in the SDK (`WEBSOCKET_URL`) for tickers/orders/positions — **not** node `eth_call` |
| **Mixed** | Same method or flow uses both backend and chain (e.g. fetch oracle payload from gateway, then submit a tx) |
| **Local** | No network: pure helpers, mapping, logging, error formatting |

**Oracle pricing in the SDK**: `getOraclePrice` (on `utils` or `api`) and `getPriceData` / `getPricesData` in `common/price` all use the **backend** endpoint `.../quote/price/oracles` for quotes and update payloads; on-chain transactions only consume fields such as `vaa`, `price`, `publishTime`.

---

## 3. Important concepts

### 3.1 Two different “pool info” APIs

| Name (export) | Definition | Data source |
|---------------|------------|-------------|
| `getPoolInfo(chainId, poolId, marketPrice?)` | `lp/pool/get.ts` | **On-chain**: `DataProvider.read.getPoolInfo` |
| `getPoolDetail` | `lp/getPoolInfo.ts` (re-exported from `getPoolInfo` in `lp/pool/index.ts`) | **Backend**: HTTP `getPoolDetail`, indexer-style pool detail |

Use **import path or full signature** in docs and code to avoid mixing them up.

### 3.2 `MyxClient.api` vs root `api` module

The `api` property on `MyxClient` is an instance of `manager/api/Api`; its methods are mostly **backend** HTTP and **overlap** with functions from `src/api/index.ts`. Prefer either `myxClient.api` **or** top-level functions consistently so auth headers stay aligned.

---

## 4. Install and initialization

```bash
pnpm add @myx-trade/sdk
# or npm / yarn
```

### 4.1 `MyxClientConfig` (`manager/config`)

| Field | Type | Description |
|-------|------|-------------|
| `chainId` | `number` | Primary chain ID for this environment; future versions may rely on per-method `chainId` instead |
| `brokerAddress` | `string` | Broker contract address (app configuration) |
| `signer` | optional | ethers v5/v6 `Signer` or `SignerLike` / `ISigner` |
| `walletClient` | optional | viem `WalletClient`; either this or `signer` (viem often preferred for smaller bundles) |
| `isTestnet` | optional | Testnet environment |
| `isBetaMode` | optional | Beta environment |
| `poolingInterval` | optional | Internal polling |
| `socketConfig` | optional | Extra WebSocket options (partial override besides `url`) |
| `logLevel` | optional | Log level |
| `getAccessToken` | optional | Sync or async fn returning `{ accessToken, expireAt }` for OpenAPI-protected routes |

After constructing the client, call `auth({ signer | walletClient | getAccessToken })` (see `SDK_INTEGRATION_GUIDE_EN.md`).

### 4.2 Logging (optional)

```ts
import { setSdkLogSink } from '@myx-trade/sdk';
setSdkLogSink(console);
```

---

## 5. MyxClient

### 5.1 Instance methods

| Method | Parameters | Returns | Data source |
|--------|------------|---------|-------------|
| `auth` | `Pick<MyxClientConfig, "signer" \| "walletClient" \| "getAccessToken">` | `void` | **Local** + **backend** if `getAccessToken` is used |
| `updateClientChainId` | `chainId`, `brokerAddress` | `void` | **Local** |
| `close` | — | `void` | Clears config and disconnects **WebSocket** |
| `getConfigManager` | — | `ConfigManager` | **Local** |
| `getAccessToken` | — | `Promise<string \| null>` | In-memory token; **does not auto-refresh** |
| `refreshAccessToken` | `forceRefresh?: boolean` | `Promise<string \| null>` | **Backend** (callback or internal refresh) |

---

### 5.2 `markets`

| Method | Parameters (summary) | Returns (summary) | Data source |
|--------|----------------------|---------------------|-------------|
| `getMarkets` | — | Always `[]` | **Local** (placeholder) |
| `getPoolLevelConfig` | `poolId`, `chainId` | Pool level config | **Backend** |
| `getKlineList` | `poolId`, `limit`, `endTime`, `chainId`, resolution → interval | K-line array | **Backend** |
| `getKlineLatestBar` | same family | Latest bar | **Backend** |
| `getTickerList` | `chainId`, `poolIds` | Ticker list | **Backend** |
| `searchMarketAuth` | `SearchMarketParams` + `address` | Search results | **Backend** (auth) |
| `searchMarket` | `SearchMarketParams` | Search results | **Backend** |
| `getFavoritesList` | `FavoritesListParams` + `address` | Watchlist | **Backend** |
| `addFavorite` / `removeFavorite` | pool + chain + `address` | Wrapped API response | **Backend** |
| `getBaseDetail` | `chainId`, `poolId` | Base asset detail | **Backend** |
| `getMarketDetail` | `chainId`, `poolId` | Market detail | **Backend** |
| `getPoolSymbolAll` | — | All pool symbols | **Backend** |
| `getPoolFundingFeeInfo` | `poolId`, `chainId`, `marketPrice` | `{ code, data \| message }`, `data` = contract `getPoolInfo` shape | **On-chain** |

---

### 5.3 `position`

| Method | Parameters (summary) | Returns (summary) | Data source |
|--------|----------------------|---------------------|-------------|
| `listPositions` | `address`, `positionId?` | `{ code, data }` or error | **Backend** (open positions) |
| `getPositionHistory` | `GetHistoryOrdersParams`, `address` | `{ code, data }` | **Backend** (history) |
| `adjustCollateral` | `poolId`, `positionId`, `adjustAmount`, `quoteToken`, `chainId`, `address` | `{ code, data: { hash } \| message }` | **Mixed**: `getOraclePrice` **backend**; margin logic **on-chain** + **backend** (dispute); tx **on-chain** `updatePriceAndAdjustCollateral` |

---

### 5.4 `order`

| Method | Parameters (summary) | Returns (summary) | Data source |
|--------|----------------------|---------------------|-------------|
| `createIncreaseOrder` | `PlaceOrderParams`, `networkFee` | `{ code, data: { transactionHash, receipt, ... } }` | **On-chain** (`TradingRouter`); may **on-chain** allowance / balance / margin |
| `closeAllPositions` | `chainId`, `PlaceOrderParams[]` | Batch close result | **On-chain** |
| `createDecreaseOrder` | `PlaceOrderParams` | same pattern | **On-chain** |
| `createPositionTpSlOrder` | `PositionTpSlOrderParams` | same pattern | **On-chain** |
| `cancelAllOrders` | `orderIds[]`, `chainId` | Receipt-related | **On-chain** |
| `cancelOrder` | `orderId`, `chainId` | same | **On-chain** |
| `cancelOrders` | `orderIds[]`, `chainId` | same | **On-chain** |
| `updateOrderTpSl` | `UpdateOrderParams`, `quoteAddress`, `chainId`, `address`, `marketId`, `isTpSlOrder?` | same | **On-chain** |
| `getOrders` | `address` | Open orders | **Backend** |
| `getOrderHistory` | `GetHistoryOrdersParams`, `address` | History | **Backend** |

Main fields for `PlaceOrderParams` are in `src/types/trading.ts`: `chainId`, `address`, `poolId`, `positionId`, `orderType`, `triggerType`, `direction`, `collateralAmount`, `size`, `price`, `executionFeeToken`, `leverage`, TP/SL fields — use string/bigint semantics consistent with contracts.

---

### 5.5 `account`

| Method | Parameters (summary) | Returns (summary) | Data source |
|--------|----------------------|---------------------|-------------|
| `getTradeFlow` | `GetHistoryOrdersParams`, `address` | `{ code, data }` | **Backend** |
| `getWalletQuoteTokenBalance` | `chainId`, `tokenAddress`, `address?` | `{ code, data: bigint }` | **On-chain** |
| `deposit` | `amount`, `tokenAddress`, `chainId` | `{ code, data: receipt }` | **On-chain** (may **on-chain** approve first) |
| `updateAndWithdraw` | `receiver`, `poolId`, `isQuoteToken`, `amount`, `chainId` | `{ code, data: receipt }` | **On-chain** |
| `getAccountInfo` | `chainId`, `address`, `poolId` | `{ code, data: AccountInfo }` | **On-chain** |
| `getAccountVipInfo` | `chainId`, `address` | Fee rates, nonce, `deadline`, etc. | **On-chain** (Broker / block) |
| `getAccountVipInfoByBackend` | `address`, `chainId`, `deadline`, `nonce` | VIP config | **Backend** |
| `getCurrentFeeDataEpoch` | `chainId` | `bigint` | **On-chain** |
| `setUserFeeData` | `address`, `chainId`, `deadline`, fee args, `signature` | `{ code, data: receipt }` | **On-chain** |
| `getAvailableMarginBalance` | `poolId`, `chainId`, `address` | `{ code, data: bigint }` | **Mixed**: `getAccountInfo` **on-chain** + `appeal.getAppealStatus` **backend** |

---

### 5.6 `utils`

| Method | Description | Data source |
|--------|-------------|-------------|
| `getOrderIdFromTransaction` | Decode `OrderPlaced` from receipt `logs` | **On-chain** (receipt) |
| `needsApproval` | Compare ERC20 `allowance` to required amount | **On-chain** |
| `approveAuthorization` | Send `approve` tx | **On-chain** |
| `getUserTradingFeeRate` | `Broker.getUserFeeRate` | **On-chain** |
| `getNetworkFee` | `MarketManager.getExecutionFee` | **On-chain** |
| `getOraclePrice` | Wraps `getPriceData` | **Backend** |
| `buildUpdatePriceParams` | Build calldata args from oracle payload | **Mixed** |
| `transferKlineResolutionToInterval` | Map resolution enum to HTTP interval | **Local** |
| `getErrorMessage` / `formatErrorMessage` | User-facing errors | **Local** (may decode on-chain revert) |
| `checkSeamlessGas` | Relay fee vs balance | **On-chain** |
| `getLiquidityInfo` | `DataProvider.getPoolInfo` | **On-chain** |
| `getGasPriceByRatio` / `getGasLimitByRatio` | Gas policy | **On-chain** + config |

---

### 5.7 `api` (`Api` class — mirrors HTTP gateway)

All listed methods are **backend** HTTP (see `src/manager/api/index.ts`). Typical envelope: `ApiResponse<T>` with `code` / `msg` / `data` (success code in `ErrorCode`).

Including but not limited to:

- Quotes: `getOraclePrice`, `getKlineData`, `getKlineLatestBar`, `getTickerData`, `getAllTickers`
- Market scan: `getPoolDetail`, `getPoolList`, `getPoolSymbolAll`, `getMarketList`, `getBaseDetail`, `getMarketDetail`, `getPoolLevelConfig`
- Account & orders: `getPositions`, `getOrders`, `getPoolOpenOrders`, `getHistoryOrders`, `getPositionHistory`, `getTradeFlow`
- Watchlist & search: `searchMarket`, `searchMarketAuth`, `addFavorite`, `removeFavorite`, `getFavoritesList`
- Forwarder: `fetchForwarderGetApi`, `forwarderTxApi`
- VIP: `getAccountVipInfo`
- Disputes & voting: `getAppealList`, `getAppealDetail`, `uploadAppealEvidence`, `getAppealReconsiderationList`, `getAppealReconsiderationDetail`, `getAppealReimbursementList`, `getAppealNodeVoteList`, `getAppealNodeVoteDetails`, `getIsVoteNode`, `postVoteSignature`, `getPedingVoteCount`, `getMyAppealCount`, `getWarmholeSign`, `getDisputeTotalCount`, `getAppealTotalCount`, `getReimbursementTotalCount`
- Other: `getCurrentEpoch`, `getPoolAppealStatus`

---

### 5.8 `seamless`

| Method | Description | Data source |
|--------|-------------|-------------|
| `onCheckRelayer` | Forwarder relayer flag + allowance | **On-chain** |
| `getContractAbiAndAddressByFunctionName` | Resolve ABI + contract address | **Local** |
| `getUSDPermitParams` | Permit parameters | **On-chain** + local signing |
| `getForwardEip712Domain` | Forwarder EIP-712 domain | **On-chain** |
| `forwardTxInFront` | Sign on behalf + submit | **Mixed** (on-chain nonce + **backend** forwarder + poll) |
| `forwarderTx` | Wallet-signed submit | **Mixed** |
| `authorizeSeamlessAccount` | Authorize seamless wallet | **Mixed** |
| `getOriginSeamlessAccount` | `originAccount` | **On-chain** |
| `formatForwarderTxParams` | Build `ForwardRequest` fields | **On-chain** nonce read + **local**; no standalone HTTP |

---

### 5.9 `appeal`

| Kind | Methods | Data source |
|------|---------|-------------|
| On-chain txs | `submitAppeal`, `voteForAppeal`, `claimAppealMargin`, `claimReimbursement`, `getDisputeConfiguration`, `submitAppealByVoteNode`, `appealReconsideration`, … | **On-chain**; price updates via `buildUpdatePriceParams` → **mixed** |
| HTTP wrappers | `getAppealList`, `getAppealDetail`, `uploadAppealEvidence`, … (same as `api` dispute module) | **Backend** |
| | `getAppealStatus(poolId, chainId, address)` | **Backend** (pool dispute state) |

---

### 5.10 `referrals`

| Method | Data source |
|--------|-------------|
| `claimRebate(tokenAddress)` | **On-chain** |

---

### 5.11 `subscription` (`SubScription`)

| Method | Description | Data source |
|--------|-------------|-------------|
| `connect` / `disconnect` / `reconnect` | Connection lifecycle | **WebSocket** |
| `subscribeTickers` / `subscribeKline` | Public market data | **WebSocket** |
| `auth` | SDK sign-in for private topics | **WebSocket** |
| `subscribePosition` / `subscribeOrder` | Requires `auth` first | **WebSocket** |
| `on` / `off` | Client-side events | **Local** |
| `isConnected` | Connection flag | **Local** |

---

## 6. Root package exports

### 6.1 From `src/index.ts`

- **LP**: `export * from "./lp"` plus namespaces `base`, `quote`, `pool`, `market`.
- **`src/api/index.ts`**: HTTP helpers for scan/quotes (`getOraclePrice`, `getPoolDetail`, `getTickerData`, `getMarketList`, …) — all **backend**; re-exports `account` (types), `seamless` (types), `pool` (`getPoolList`).
- **`common`**: `approve`, `allowance`, `balanceOf`, `tradingGas`, `tokenInfo`, `formatUnits`/`parseUnits` (viem); `getPriceData`/`getPricesData` → **backend**; most other calls **on-chain**; `getTokenInfo` may use **third-party HTTP** (icon `HEAD`).
- **`MxSDK`, `getWalletProvider`**: `MxSDK.getMarkets()` → **backend** `getMarketList`; `getWalletProvider` needs `auth`, returns **on-chain** `WalletClient`.
- **`getPublicClient`, `getWalletClient`, `setConfigManagerForViem`**: **On-chain** RPC clients (require `ConfigManager`).
- **`MyxClient`** and `export * from "./manager"` types (`api/type`, subscription types, etc.).
- **`ISigner`, `SignerLike`, `fromViemWalletClient`, `normalizeSigner`**: signer adapters.
- **`ChainId`, `SDK_VERSION`**.
- **`Logger`, `setSdkLogSink`, `getSdkLogSink`, `sdkLog`, `sdkWarn`, `sdkError`**: logging.

### 6.2 `MxSDK` singleton (`web3/index.ts`)

| Member | Description | Data source |
|--------|-------------|-------------|
| `getMarkets()` | Fetch and cache market list | **Backend** |
| `setConfigManager` / `getConfigManager` | Shared with `MyxClient` | **Local** |
| `setProvider` / `getProvider` | Deprecated; prefer `getWalletClient` | — |

---

## 7. Subpath `@myx-trade/sdk/lp`

See `src/lp/index.ts`: namespaces `base`, `quote`, `pool`, `market`, and constants such as `COMMON_PRICE_DECIMALS`, `COMMON_LP_AMOUNT_DECIMALS`.

### 7.1 `base` (`lp/base/index.ts`)

| Export | Data source |
|--------|-------------|
| `deposit`, `withdraw`, `withdrawableLpAmount` | Mostly **on-chain** |
| `claimBasePoolRebate`, `claimBasePoolRebates` | **On-chain** |
| `getRewards` | **Mixed** if it calls `getOraclePrice` |
| `previewUserWithdrawData` | **Mixed** (oracle **backend** + BasePool `previewUserWithdrawData` **on-chain**) |
| `previewLpAmountOut`, `previewBaseAmountOut` | **On-chain** |
| `getLpPrice` (in `base/price`) | Mostly **on-chain** (do not confuse with `quote/price`) |

### 7.2 `quote` (`lp/quote/index.ts`)

| Export | Data source |
|--------|-------------|
| `deposit`, `withdraw`, `withdrawableLpAmount`, `transfer` | **On-chain**; `transfer` validates via HTTP `getPoolInfo` → **mixed** |
| `getRewards`, `claimQuotePoolRebate`, `claimQuotePoolRebates` | **Mixed** where oracle is used |
| `getLpPrice` | **Mixed** (`getPriceData` **backend** + `QuotePool.getPoolTokenPrice` **on-chain**) |

### 7.3 `pool` (`lp/pool/index.ts`)

| Export | Data source |
|--------|-------------|
| `getMarketPoolId`, `getMarketPools`, `getPoolInfo` (three args incl. `marketPrice`) | **On-chain** |
| `getPoolDetail` | **Backend** (see [3.1](#31-two-different-pool-info-apis)) |
| `getUserGenesisShare`, `createPool`, `addTpSl`, `cancelTpSl`, `reprime`, `getOpenOrders` | `getOpenOrders` is **backend**; others are mainly **on-chain** reads/writes |

Types: `AddTpSLParams`, `CancelTpSLParams`, `CreatePoolRequest`, `TpSLParams`, `TpSl`, etc. — `lp/pool/type.ts`.

### 7.4 `market`

| Export | Data source |
|--------|-------------|
| `getMarket` | **On-chain** |
| `getOracleFee` | **On-chain** |

### 7.5 Root `getPoolInfo` (`lp/getPoolInfo.ts`)

- **`getPoolInfo(chainId, poolId)`** calls HTTP `getPoolDetail` → **backend**; distinct from on-chain `getPoolInfo` in `pool/get.ts`. The `pool` submodule re-exports the HTTP variant as `getPoolDetail` to reduce confusion; root still exports `getPoolInfo` — mind the import path.

---

## 8. Appendix

### 8.1 Backend base URL (`getBaseUrlByEnv`)

| Condition | Host |
|-----------|------|
| `isBetaMode` | `https://api-beta.myx.finance` |
| `isTestnet` | `https://api-test.myx.cash` |
| else | `https://api.myx.finance` |

### 8.2 WebSocket environment (`SubScription` constructor)

Select MainNet / BetaNet / TestNet from `WEBSOCKET_URL` based on `isBetaMode` / `isTestnet` (see `src/manager/const/socket.ts`).

### 8.3 Types and errors

- Trading enums and `PlaceOrderParams`: `src/types/trading.ts`
- Order updates: `src/types/order.ts`
- HTTP envelopes and DTOs: `src/api/type.ts`
- SDK error codes: `src/manager/error/const.ts`

### 8.4 Generation and build

- ABI: `pnpm run gen:abi` (TypeChain)
- Build: `pnpm run build` → `dist/`, declarations in `dist/index.d.ts` and `dist/lp.d.ts`

---

## Maintaining this document

- When APIs are added or removed, update these tables and `src/index.ts` / `package.json` `exports` accordingly.
- For field-level JSON examples, consider generating a draft from `dist/*.d.ts` with TypeDoc, then add business notes and this **data source** column manually.
