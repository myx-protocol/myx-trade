# MYX Trade SDK 全量 API 参考（中文）

本文档描述 `@myx-trade/sdk` 与 `@myx-trade/sdk/lp` 的对外能力，包含**方法说明、参数与返回值要点**，并标注每条能力涉及的**数据来源**（链上 / 后端 HTTP / WebSocket / 混合）。

**版本**：以 `package.json` 中 `version` 为准；运行时可通过导出的 `SDK_VERSION` 读取。

**相关文档**：同目录下的 `SDK_INTEGRATION_GUIDE_ZH.md` 偏集成流程与示例；本文档偏 **API 清单与数据流**。英文全量 API 参考：`SDK_API_REFERENCE_FULL_EN.md`。

---

## 目录

1. [包与入口](#1-包与入口)
2. [数据来源图例](#2-数据来源图例)
3. [重要概念](#3-重要概念)
4. [安装与初始化](#4-安装与初始化)
5. [MyxClient](#5-myxclient)
6. [顶层导出（主包）](#6-顶层导出主包)
7. [子包 @myx-trade/sdk/lp](#7-子包-myx-tradesdklp)
8. [下单、保证金与 Deposit（业务口径）](#8-下单保证金与-deposit业务口径)
9. [附录](#9-附录)

---

## 1. 包与入口

| 入口 | 说明 |
|------|------|
| `@myx-trade/sdk` | 主包：`MyxClient`、HTTP 封装、`common`、`web3`、`signer`、`types`、LP 的再导出等 |
| `@myx-trade/sdk/lp` | 仅 LP 相关子模块（`base` / `quote` / `pool` / `market` 命名空间），便于按需引用 |

`package.json` 的 `exports` 字段定义了 `"."` 与 `"./lp"` 的 `types` / `import` / `require` 映射。

---

## 2. 数据来源图例

| 标记 | 含义 |
|------|------|
| **链上** | 通过区块链节点 RPC：合约 `read`/`write`、`getGasPrice`、`getBlock`、`waitForTransactionReceipt`、解析交易 `receipt.logs` 等 |
| **后端** | HTTP 请求 MYX 开放网关（`openapi/gateway`、`v2/agent` 等），见 `src/api/request.ts` |
| **WebSocket** | 连接 SDK 配置的实时网关（`WEBSOCKET_URL`），推送行情/订单/持仓等，**不是**节点 `eth_call` |
| **混合** | 同一方法或流程中同时涉及后端与链上（例如先拉网关预言机数据再上链） |
| **本地** | 无网络：纯计算、类型映射、日志、错误格式化等 |

**预言机价格在 SDK 中的路径**：`getOraclePrice`（`utils` 或 `api`）与 `common/price` 中的 `getPriceData` / `getPricesData` 均通过 **后端** `.../quote/price/oracles` 获取报价与更新载荷；链上交易仅消费返回的 `vaa`、`price`、`publishTime` 等字段。

---

## 3. 重要概念

### 3.1 两个不同的「池子信息」

| 名称（导出） | 定义位置 | 数据来源 |
|--------------|----------|----------|
| `getPoolInfo(chainId, poolId, marketPrice?)` | `lp/pool/get.ts` | **链上**：`DataProvider.read.getPoolInfo` |
| `getPoolDetail` | `lp/getPoolInfo.ts`（在 `lp/pool/index.ts` 中从 `getPoolInfo` 重命名导出） | **后端**：`getPoolDetail` HTTP，扫描侧池子详情 |

接入文档与代码中务必用**完整导入路径或签名**区分，避免混用。

### 3.2 `MyxClient.api` 与主包 `api` 模块

`MyxClient` 内置的 `api` 是 `manager/api/Api` 类实例，方法多为 **后端** HTTP，与 `src/api/index.ts` 中导出的函数**语义重叠**；业务上推荐统一通过 `myxClient.api` 或统一使用顶层函数，避免混用两套调用风格导致鉴权头不一致。

---

## 4. 安装与初始化

```bash
pnpm add @myx-trade/sdk
# 或 npm / yarn
```

### 4.1 `MyxClientConfig`（`manager/config`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `chainId` | `number` | 当前环境主链 ID；后续版本计划弱化为「各方法单独传 chainId」 |
| `brokerAddress` | `string` | Broker 合约地址（由业务侧配置） |
| `signer` | 可选 | ethers v5/v6 Signer 或兼容 `SignerLike` / `ISigner` |
| `walletClient` | 可选 | viem `WalletClient`；与 `signer` 二选一即可（常用 viem 以减小包体） |
| `isTestnet` | 可选 | 是否测试网环境 |
| `isBetaMode` | 可选 | 是否 Beta 环境 |
| `poolingInterval` | 可选 | 与内部轮询相关 |
| `socketConfig` | 可选 | WebSocket 额外配置（除 `url` 外可部分覆盖） |
| `logLevel` | 可选 | 日志级别 |
| `getAccessToken` | 可选 | 返回 `{ accessToken, expireAt }` 的同步或异步函数，供需要 OpenAPI 鉴权的接口使用 |

创建实例后需调用 `auth({ signer | walletClient | getAccessToken })` 完成钱包与 token 相关配置（见 `SDK_INTEGRATION_GUIDE_ZH.md`）。

### 4.2 日志（可选）

```ts
import { setSdkLogSink } from '@myx-trade/sdk';
setSdkLogSink(console);
```

---

## 5. MyxClient

### 5.1 实例方法与配置

| 方法 | 参数 | 返回 | 数据来源 |
|------|------|------|----------|
| `auth` | `Pick<MyxClientConfig, "signer" \| "walletClient" \| "getAccessToken">` | `void` | **本地** + 后续鉴权依赖 **后端**（若提供 `getAccessToken`） |
| `updateClientChainId` | `chainId`, `brokerAddress` | `void` | **本地** |
| `close` | — | `void` | 清理配置并断开 **WebSocket** |
| `getConfigManager` | — | `ConfigManager` | **本地** |
| `getAccessToken` | — | `Promise<string \| null>` | 内存中的 token，**不自动刷新** |
| `refreshAccessToken` | `forceRefresh?: boolean` | `Promise<string \| null>` | **后端**（通过 `getAccessToken` 回调或内部刷新逻辑） |

---

### 5.2 `markets`

| 方法 | 参数要点 | 返回要点 | 数据来源 |
|------|------------|----------|----------|
| `getMarkets` | — | 恒为 `[]` | **本地**（当前实现占位） |
| `getPoolLevelConfig` | `poolId`, `chainId` | 池子档位配置 | **后端** |
| `getKlineList` | `poolId`, `limit`, `endTime`, `chainId`, `interval`（内部由 `KlineResolution` 转换） | K 线数组 | **后端** |
| `getKlineLatestBar` | 同上（latest） | 单根 K 线 | **后端** |
| `getTickerList` | `chainId`, `poolIds` | Ticker 列表 | **后端** |
| `searchMarketAuth` | `SearchMarketParams` + 需 `address` | 搜索结果 | **后端**（需 token） |
| `searchMarket` | `SearchMarketParams` | 搜索结果 | **后端** |
| `getFavoritesList` | `FavoritesListParams` + `address` | 自选列表 | **后端** |
| `addFavorite` / `removeFavorite` | 池与链参数 + `address` | 业务码封装 | **后端** |
| `getBaseDetail` | `chainId`, `poolId` | 标的详情 | **后端** |
| `getMarketDetail` | `chainId`, `poolId` | 市场详情 | **后端** |
| `getPoolSymbolAll` | — | 全池符号表 | **后端** |
| `getPoolFundingFeeInfo` | `poolId`, `chainId`, `marketPrice` | `{ code, data \| message }`，`data` 为合约 `getPoolInfo` 结构 | **链上** |

---

### 5.3 `position`

| 方法 | 参数要点 | 返回要点 | 数据来源 |
|------|------------|----------|----------|
| `listPositions` | `address`, `positionId?` | `{ code, data }` 或错误 | **后端**（开放持仓） |
| `getPositionHistory` | `GetHistoryOrdersParams`, `address` | `{ code, data }` | **后端**（历史持仓） |
| `adjustCollateral` | `poolId`, `positionId`, `adjustAmount`, `quoteToken`, `chainId`, `address` | `{ code, data: { hash } \| message }` | **混合**：`getOraclePrice` **后端**；保证金可用额逻辑含 **链上** + **后端**（争议状态）；交易 **链上** `updatePriceAndAdjustCollateral` |

---

### 5.4 `order`

| 方法 | 参数要点 | 返回要点 | 数据来源 |
|------|------------|----------|----------|
| `createIncreaseOrder` | `PlaceOrderParams`, `networkFee` | `{ code, data: { transactionHash, receipt, ... } }` | **链上**（`TradingRouter`）；前置 **链上** allowance / 余额与 **链上** 账户可用保证金 |
| `closeAllPositions` | `chainId`, `PlaceOrderParams[]` | 多笔平仓结果 | **链上** |
| `createDecreaseOrder` | `PlaceOrderParams` | 同上 | **链上** |
| `createPositionTpSlOrder` | `PositionTpSlOrderParams` | 同上 | **链上** |
| `cancelAllOrders` | `orderIds[]`, `chainId` | 交易回执相关 | **链上** |
| `cancelOrder` | `orderId`, `chainId` | 同上 | **链上** |
| `cancelOrders` | `orderIds[]`, `chainId` | 同上 | **链上** |
| `updateOrderTpSl` | `UpdateOrderParams`, `quoteAddress`, `chainId`, `address`, `marketId`, `isTpSlOrder?` | 同上 | **链上** |
| `getOrders` | `address` | 当前挂单 | **后端** |
| `getOrderHistory` | `GetHistoryOrdersParams`, `address` | 历史订单 | **后端** |

`PlaceOrderParams` 主要字段见 `src/types/trading.ts`：`chainId`, `address`, `poolId`, `positionId`, `orderType`, `triggerType`, `direction`, `collateralAmount`, `size`, `price`, `executionFeeToken`, `leverage`, `tp/sl` 等（均为字符串或数值，精度需与合约一致）。

**保证金、networkFee、tradingFee 与 Deposit 的业务口径**（开仓/平仓拆分）见 [第 8 节](#8-下单保证金与-deposit业务口径)。

---

### 5.5 `account`

| 方法 | 参数要点 | 返回要点 | 数据来源 |
|------|------------|----------|----------|
| `getTradeFlow` | `GetHistoryOrdersParams`, `address` | `{ code, data }` | **后端** |
| `getWalletQuoteTokenBalance` | `chainId`, `tokenAddress`, `address?` | `{ code, data: bigint }` | **链上** |
| `deposit` | `amount`, `tokenAddress`, `chainId` | `{ code, data: receipt }` | **链上**（可能先 **链上** approve） |
| `updateAndWithdraw` | `receiver`, `poolId`, `isQuoteToken`, `amount`, `chainId` | `{ code, data: receipt }` | **链上** |
| `getAccountInfo` | `chainId`, `address`, `poolId` | `{ code, data: AccountInfo }` | **链上** |
| `getAccountVipInfo` | `chainId`, `address` | 费率、nonce、`deadline` 等 | **链上**（Broker / Block） |
| `getAccountVipInfoByBackend` | `address`, `chainId`, `deadline`, `nonce` | VIP 配置 | **后端** |
| `getCurrentFeeDataEpoch` | `chainId` | `bigint` | **链上** |
| `setUserFeeData` | `address`, `chainId`, `deadline`, 费率参数, `signature` | `{ code, data: receipt }` | **链上** |
| `getAvailableMarginBalance` | `poolId`, `chainId`, `address` | `{ code, data: bigint }` | **混合**：`getAccountInfo` **链上** + `appeal.getAppealStatus` **后端** |

---

### 5.6 `utils`

| 方法 | 说明 | 数据来源 |
|------|------|----------|
| `getOrderIdFromTransaction` | 从 receipt `logs` 解析 `OrderPlaced` | **链上**（回执） |
| `needsApproval` | ERC20 `allowance` 与需求量比较 | **链上** |
| `approveAuthorization` | `approve` 交易 | **链上** |
| `getUserTradingFeeRate` | `Broker.getUserFeeRate` | **链上** |
| `getNetworkFee` | `MarketManager.getExecutionFee` | **链上** |
| `getOraclePrice` | 封装 `getPriceData` | **后端** |
| `buildUpdatePriceParams` | 基于 `getOraclePrice` 组上链参数 | **混合** |
| `transferKlineResolutionToInterval` | 分辨率枚举映射 | **本地** |
| `getErrorMessage` / `formatErrorMessage` | 错误解析展示 | **本地**（可能解析链上 revert） |
| `checkSeamlessGas` | 转发费与余额 | **链上** |
| `getLiquidityInfo` | `DataProvider.getPoolInfo` | **链上** |
| `getGasPriceByRatio` / `getGasLimitByRatio` | Gas 策略 | **链上** + 配置 |

---

### 5.7 `api`（`Api` 类，与 HTTP 网关一一对应）

以下均为 **后端** HTTP（具体路径见 `src/manager/api/index.ts`），常见返回包裹为 `ApiResponse<T>`（`code`/`msg`/`data`，成功码见 `ErrorCode`）。

包含但不限于：

- 行情：`getOraclePrice`, `getKlineData`, `getKlineLatestBar`, `getTickerData`, `getAllTickers`
- 市场扫描：`getPoolDetail`, `getPoolList`, `getPoolSymbolAll`, `getMarketList`, `getBaseDetail`, `getMarketDetail`, `getPoolLevelConfig`
- 账户与订单：`getPositions`, `getOrders`, `getPoolOpenOrders`, `getHistoryOrders`, `getPositionHistory`, `getTradeFlow`
- 自选与搜索：`searchMarket`, `searchMarketAuth`, `addFavorite`, `removeFavorite`, `getFavoritesList`
- Forwarder：`fetchForwarderGetApi`, `forwarderTxApi`
- VIP：`getAccountVipInfo`
- 争议与节点投票：`getAppealList`, `getAppealDetail`, `uploadAppealEvidence`, `getAppealReconsiderationList`, `getAppealReconsiderationDetail`, `getAppealReimbursementList`, `getAppealNodeVoteList`, `getAppealNodeVoteDetails`, `getIsVoteNode`, `postVoteSignature`, `getPedingVoteCount`, `getMyAppealCount`, `getWarmholeSign`, `getDisputeTotalCount`, `getAppealTotalCount`, `getReimbursementTotalCount`
- 其它：`getCurrentEpoch`, `getPoolAppealStatus`

---

### 5.8 `seamless`

| 方法 | 说明 | 数据来源 |
|------|------|----------|
| `onCheckRelayer` | Forwarder 是否启用 relayer + allowance | **链上** |
| `getContractAbiAndAddressByFunctionName` | 按函数名返回 ABI 与地址 | **本地** |
| `getUSDPermitParams` | Permit 参数 | **链上** + 本地签名 |
| `getForwardEip712Domain` | Forwarder EIP-712 域 | **链上** |
| `forwardTxInFront` | 代签 + 提交 forwarder | **混合**（链上读 nonce + **后端** `forwarderTx` + 轮询 `fetchForwarderGet`） |
| `forwarderTx` | 钱包签名后提交 | **混合** |
| `authorizeSeamlessAccount` | 授权无缝账户 | **混合** |
| `getOriginSeamlessAccount` | `originAccount` | **链上** |
| `formatForwarderTxParams` | 构造 ForwardRequest 字段 | **链上**读 nonce + **本地**；不单独发 HTTP |

---

### 5.9 `appeal`

| 类型 | 方法 | 数据来源 |
|------|------|----------|
| 链上交易 | `submitAppeal`, `voteForAppeal`, `claimAppealMargin`, `claimReimbursement`, `getDisputeConfiguration`, `submitAppealByVoteNode`, `appealReconsideration` 等 | **链上**；若含更新价格则经 `buildUpdatePriceParams` → **混合** |
| HTTP 封装 | `getAppealList`, `getAppealDetail`, `uploadAppealEvidence`, `getAppealReconsiderationList`, …（与 `api` 争议模块一致） | **后端** |
| | `getAppealStatus(poolId, chainId, address)` | **后端**（池子争议状态） |

---

### 5.10 `referrals`

| 方法 | 数据来源 |
|------|----------|
| `claimRebate(tokenAddress)` | **链上** |

---

### 5.11 `subscription`（`SubScription`）

| 方法 | 说明 | 数据来源 |
|------|------|----------|
| `connect` / `disconnect` / `reconnect` | 管理连接 | **WebSocket** |
| `subscribeTickers` / `subscribeKline` | 公共行情订阅 | **WebSocket** |
| `auth` | SDK 账户签名登录 | **WebSocket** |
| `subscribePosition` / `subscribeOrder` | 需先 `auth` | **WebSocket** |
| `on` / `off` | 客户端事件 | **本地** |
| `isConnected` | 是否已连接 | **本地** |

---

## 6. 顶层导出（主包）

### 6.1 自 `src/index.ts` 汇总

- **LP**：`export * from "./lp"`，以及命名空间 `base`, `quote`, `pool`, `market`。
- **`src/api/index.ts`**：与「扫描 / 行情」相关的 HTTP 函数（`getOraclePrice`, `getPoolDetail`, `getTickerData`, `getMarketList` 等），均为 **后端**；另 re-export `account`（类型）、`seamless`（类型）、`pool`（`getPoolList`）。
- **`common`**：`approve`, `allowance`, `balanceOf`, `tradingGas`, `tokenInfo`, `formatUnits`/`parseUnits`（viem）；其中 `getPriceData`/`getPricesData` 经 **后端**；其余读写多为 **链上**；`getTokenInfo` 另可能 **第三方 HTTP**（图标 HEAD）。
- **`MxSDK`, `getWalletProvider`**：`MxSDK.getMarkets()` 调 **后端** `getMarketList`；`getWalletProvider` 需已 `auth`，返回 **链上** 用 `WalletClient`。
- **`getPublicClient`, `getWalletClient`, `setConfigManagerForViem`**：**链上** RPC 客户端（依赖 `ConfigManager`）。
- **`MyxClient`** 及 `export * from "./manager"` 中的类型（如 `api/type`、订阅类型等）。
- **`ISigner`, `SignerLike`, `fromViemWalletClient`, `normalizeSigner`**：签名适配。
- **`ChainId`, `SDK_VERSION`**。
- **`Logger`, `setSdkLogSink`, `getSdkLogSink`, `sdkLog`, `sdkWarn`, `sdkError`**：日志。

### 6.2 `MxSDK` 单例（`web3/index.ts`）

| 成员 | 说明 | 数据来源 |
|------|------|----------|
| `getMarkets()` | 拉取并缓存市场列表 | **后端** |
| `setConfigManager` / `getConfigManager` | 与 `MyxClient` 共享配置 | **本地** |
| `setProvider` / `getProvider` | 已废弃，建议 `getWalletClient` | — |

---

## 7. 子包 @myx-trade/sdk/lp

导出结构见 `src/lp/index.ts`：`base`, `quote`, `pool`, `market` 四个命名空间，以及 `COMMON_PRICE_DECIMALS`、`COMMON_LP_AMOUNT_DECIMALS` 等常量。

### 7.1 `base`（`lp/base/index.ts`）

| 导出 | 数据来源 |
|------|----------|
| `deposit`, `withdraw`, `withdrawableLpAmount` | **链上**为主 |
| `claimBasePoolRebate`, `claimBasePoolRebates` | **链上** |
| `getRewards` | 若内部调用 `getOraclePrice` 则为 **混合** |
| `previewUserWithdrawData` | **混合**（Oracle **后端** + BasePool `previewUserWithdrawData` **链上**） |
| `previewLpAmountOut`, `previewBaseAmountOut` | **链上** |
| `getLpPrice`（base/price） | 以 **链上** 为主（与 quote 下同名函数注意区分文件） |

### 7.2 `quote`（`lp/quote/index.ts`）

| 导出 | 数据来源 |
|------|----------|
| `deposit`, `withdraw`, `withdrawableLpAmount`, `transfer` | **链上**；`transfer` 会调 `getPoolInfo`（**后端** 版）做校验 → **混合** |
| `getRewards`, `claimQuotePoolRebate`, `claimQuotePoolRebates` | 含 Oracle 处为 **混合** |
| `getLpPrice` | **混合**（`getPriceData` **后端** + `QuotePool.getPoolTokenPrice` **链上**） |

### 7.3 `pool`（`lp/pool/index.ts`）

| 导出 | 数据来源 |
|------|----------|
| `getMarketPoolId`, `getMarketPools`, `getPoolInfo`（三参数、`marketPrice`） | **链上** |
| `getPoolDetail` | **后端**（见 [3.1](#31-两个不同的池子信息)） |
| `getUserGenesisShare`, `createPool`, `addTpSl`, `cancelTpSl`, `reprime`, `getOpenOrders` | `getOpenOrders` 为 **后端**；其余以 **链上** 读写为主 |

类型：`AddTpSLParams`, `CancelTpSLParams`, `CreatePoolRequest`, `TpSLParams`, `TpSl` 等见 `lp/pool/type.ts`。

### 7.4 `market`

| 导出 | 数据来源 |
|------|----------|
| `getMarket` | **链上** |
| `getOracleFee` | **链上** |

### 7.5 根级 `getPoolInfo`（`lp/getPoolInfo.ts`）

- **`getPoolInfo(chainId, poolId)`**：内部调用 HTTP `getPoolDetail`，**后端**；与 `pool/get.ts` 的链上 `getPoolInfo` 不同名冲突已通过 `pool` 子模块重命名 `getPoolDetail` 缓解，但根仍保留 `getPoolInfo` 函数，接入时请注意导入路径。

---

## 8. 下单、保证金与 Deposit（业务口径）

本节描述**开仓 / 平仓**场景下，保证金占用与 **Deposit（从钱包补入保证金账户的金额）** 的**业务计算口径**，便于产品与前端对齐；链上最终结算以合约为准。

### 8.1 术语

| 术语 | 说明 |
|------|------|
| **保证金总量** | 完成该笔下单所需占用的保证金侧总量（含费用项），用于理解资金占用。 |
| **networkFee** | 执行费（链上 execution / 网络执行费）。单笔基数可通过 `myxClient.utils.getNetworkFee(marketId, chainId)` 获取；业务上可能按场景累加多笔（开仓、TP、SL、爆仓预留、平仓等）。 |
| **tradingFee** | 交易手续费，一般按名义价值 × 用户费率计算，例如 `size × price × takerFeeRate`；费率来自 `myxClient.utils.getUserTradingFeeRate`（链上 `Broker.getUserFeeRate`）。 |
| **Deposit** | 若**账户可用保证金**不足以覆盖「需占用总量」，差额需从钱包转入保证金账户；对应 SDK 里下单参数中的 `depositData.amount`（由 `createIncreaseOrder` / `createDecreaseOrder` 等与 `account.getAvailableMarginBalance` 比较后算出）。 |

一般地：**需 Deposit 的金额** \(=\max(0,\ \text{保证金总量} - \text{当前可用保证金})\)（与链上精度、币种一致）。

### 8.2 开仓（加仓，`OperationType.INCREASE`）

**无持仓（新建仓，无已有 `positionId`）**

\[
\text{保证金总量} = \text{collateral} + \text{networkFee(开仓执行费)} + \text{networkFee(若设 TP)} + \text{networkFee(若设 SL)} + \text{networkFee(预留爆仓的执行费)} + \text{tradingFee}
\]

**已有持仓（加仓，已有 `positionId`）**

\[
\text{保证金总量} = \text{collateral} + \text{networkFee(开仓执行费)} + \text{networkFee(若设 TP)} + \text{networkFee(若设 SL)} + \text{tradingFee}
\]

与「无持仓」相比，**不包含**「预留爆仓的执行费」这一项。

源码中 `Order.createIncreaseOrder` 注释亦区分了无仓与有仓场景下执行费项数（例如无仓多一项预留爆仓费），与本节一致。

### 8.3 平仓（减仓，`OperationType.DECREASE`）

**部分平仓**

\[
\text{保证金总量} = \text{networkFee(平仓执行费)} + \Delta
\]

其中 \(\Delta\)：若**剩余保证金**不足以支付本次平仓所需的**网络执行费**，则需**增加**不足部分（等价于补足「缺口」对应的金额，使能覆盖该笔 `networkFee`）。

**全部平仓**

\[
\text{保证金总量} = 0
\]

批量全平可参考 `order.closeAllPositions`：内部 `depositData.amount` 为 `'0'`。

### 8.4 与 SDK `Order` 方法的衔接

- **`createIncreaseOrder(params, networkFee)`**  
  - 第二个参数 `networkFee` 为调用方传入的字符串；**当前实现**中 `needAmount = BigInt(collateralAmount) + BigInt(networkFee)`，再与 `getAvailableMarginBalance` 比较差值得到 `depositAmount`。  
  - 若产品按 [8.2](#82-开仓加仓operationtypeincrease) 将多笔执行费拆开，应在**调用前自行汇总**为传入的 `networkFee`（并与 `tradingFee`、`collateral` 等业务公式对齐，避免重复或遗漏）。  
  - `tradingFee` 通常体现在合约侧或订单参数的业务校验中，接入时请以实际产品规则与链上行为为准。

- **`createDecreaseOrder`**  
  - 内部用 `collateralAmount` 与可用保证金比较决定是否追加 `deposit`；部分平仓时语义与 [8.3](#83-平仓减仓operationtypedecrease) 一致。

---

## 9. 附录

### 9.1 后端 Base URL（`getBaseUrlByEnv`）

| 条件 | 主机（逻辑） |
|------|----------------|
| `isBetaMode` | `https://api-beta.myx.finance` |
| `isTestnet` | `https://api-test.myx.cash` |
| 否则 | `https://api.myx.finance` |

### 9.2 WebSocket 环境（`SubScription` 构造）

根据 `isBetaMode` / `isTestnet` 选择 `WEBSOCKET_URL` 中 MainNet / BetaNet / TestNet（见 `src/manager/const/socket.ts`）。

### 9.3 类型与错误

- 交易枚举与 `PlaceOrderParams`：`src/types/trading.ts`
- 订单更新：`src/types/order.ts`
- HTTP 响应包裹与业务类型：`src/api/type.ts`
- SDK 错误码：`src/manager/error/const.ts`

### 9.4 生成与构建

- ABI：`pnpm run gen:abi`（TypeChain）
- 构建：`pnpm run build` → 输出 `dist/`，类型定义在 `dist/index.d.ts` 与 `dist/lp.d.ts`

---

## 文档维护说明

- 新增或废弃 API 时，请同步更新本文档表格与 `src/index.ts` / `package.json` exports。
- 若需「每个字段级 JSON 示例」，建议在稳定版本后基于 `dist/*.d.ts` 用 TypeDoc 生成初稿，再人工补充业务含义与本「数据来源」列。
