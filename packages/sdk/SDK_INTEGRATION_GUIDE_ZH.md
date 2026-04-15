# MYX Trade SDK 集成指南

## Enum

### MarketPoolState
```typescript
enum MarketPoolState {
  Cook = 0, // 市场建立
  Boosted = 1,  // 市场开启中，待 TVL 达标后生效
  Primed = 1, // 扣款手续费，等待准备oracle
  Trench = 2, // 上架交易
  PreBench = 3, // 预下架
  Bench = 4, // 下架
}
```
### OracleType
```typescript
export enum OracleType {
  Chainlink = 1, 
  Pyth,
}
```

## 概述

MYX Trade SDK 是一个用于衍生品交易的 TypeScript/JavaScript SDK。它提供订单下单、持仓管理、市场数据、订阅、账户管理、无 Gas 钱包和 LP 操作等功能。

**文档配套**：完整 API 清单、数据来源与**保证金 / networkFee / Deposit 业务公式**见同目录 [`SDK_API_REFERENCE_FULL_ZH.md`](./SDK_API_REFERENCE_FULL_ZH.md)（第 8 节）。

## 安装

```bash
npm install @myx-trade/sdk
# 或
yarn add @myx-trade/sdk
# 或
pnpm add @myx-trade/sdk
```

## 模块：初始化与配置

### 初始化 SDK 客户端

推荐使用 viem 的 `WalletClient`，无需安装 ethers：

```typescript
import { MyxClient } from '@myx-trade/sdk';

// 例如从 wagmi 的 useWalletClient() 获取 walletClient
const myxClient = new MyxClient({
  chainId: 421614, // 当前版本仍需要；后续版本计划移除（方法参数里会单独传 chainId）
  walletClient, // viem WalletClient，或使用 signer（符合 SignerLike 的对象）
  brokerAddress: BROKER_ADDRESS, // 从 MYX 团队获取
  isTestnet: true, // true 为测试网，false 为 Beta
  isBetaMode: false, // true 为 Beta 环境
});
```

若使用 ethers v5/v6 的 Signer，可传入 `signer` 替代 `walletClient`，SDK 会自动适配。

### 日志输出（可选）

SDK 默认不直接访问全局 `console`（日志 sink 默认为 no-op）。如果你希望在前端控制台看到 SDK 日志，请在应用入口设置日志 sink：

```typescript
import { setSdkLogSink } from '@myx-trade/sdk';

setSdkLogSink(console);
```

### SDK 认证和访问令牌

创建 SDK 实例后，必须调用 `auth` 方法完成认证。

`auth` 方法支持以下参数（按需传入）：

1. **signer** - 用于签署交易（ethers v5/v6 或兼容 SignerLike）。
2. **walletClient** - viem 钱包客户端实例。
3. **getAccessToken** - 用于获取 accessToken 的回调函数（可选）。

说明：
- `signer` 与 `walletClient` 二选一即可（也可同时传，通常优先用 `walletClient`）。
- 如果你的业务会调用需要 accessToken 的接口，请提供 `getAccessToken`。

#### getAccessToken 回调

`getAccessToken` 参数是一个回调函数。每当需要访问令牌时，SDK 会调用此函数。

accessToken 的生成与签发策略属于项目接入信息，请联系项目方获取。

`getAccessToken` 回调需返回如下结构：

```typescript
{
  accessToken: string, // 访问令牌
  expireAt: number     // 过期时间（秒级时间戳）
}
```

**认证示例：**

```typescript
const getAccessToken = async () => {
  // 访问令牌获取逻辑由业务侧实现（具体接入方式请联系项目方）
  return fetchTokenFromYourBackend();
}

// 只用 viem walletClient
myxClient.auth({ walletClient, getAccessToken });

// 或者只用 signer
// myxClient.auth({ signer, getAccessToken });
```

### AccessToken 手动读取与刷新

```typescript
// 读取当前缓存 token（不触发刷新）
const token = await myxClient.getAccessToken();

// 手动刷新 token（forceRefresh=true 会强制调用 getAccessToken）
await myxClient.refreshAccessToken(true);
```

## Types

SDK 会在入口导出一些 TypeScript 类型，便于你在业务侧进行类型约束/提示。

### 签名器类型（用于 `auth`）

- `ISigner`：通用签名器接口，至少包含 `getAddress`、`signMessage`、`sendTransaction`；`signTypedData` 为可选（用于 EIP-712 permit/forwarder 等流程）。
- `SignerLike`：`auth({ signer })` 可接受的联合类型（`ISigner` 或兼容形状）。

### 地址与下单参数类型

- `address`：EOA 地址入参，格式为 ``0x${string}``。
- `PlaceOrderParams`：用于 `myxClient.order.createIncreaseOrder` / `createDecreaseOrder` 等方法的参数接口。
- `PositionTpSlOrderParams`：用于 `myxClient.order.createPositionTpSlOrder` 止盈止损参数接口。

### 示例

```ts
import type { PlaceOrderParams, ISigner, SignerLike } from '@myx-trade/sdk';

const userAddress = '0x1234...abcd' as `0x${string}`;

const incParams: PlaceOrderParams = {
  chainId: 421614,
  address: userAddress,
  poolId: '0xpool...',
  positionId: '',
  // 其余字段按你具体的订单类型补齐
} as PlaceOrderParams;
```

### 更新客户端链

```typescript
// 切换到不同的链
myxClient.updateClientChainId(newChainId, NEW_BROKER_ADDRESS);
```

## 模块：订单（Order）

### 保证金、执行费（networkFee）与 Deposit（业务口径）

下单前需理解「需要占用多少保证金 / 从钱包补多少 Deposit」。**详细公式与 SDK 衔接**见 [`SDK_API_REFERENCE_FULL_ZH.md` 第 8 节](./SDK_API_REFERENCE_FULL_ZH.md#8-下单保证金与-deposit业务口径)。以下为摘要：

**开仓 / 加仓（`createIncreaseOrder`）**

- **无持仓（`positionId` 为空）**：保证金总量 ≈ `collateral` + 开仓执行费 +（有 TP）执行费 +（有 SL）执行费 + **预留爆仓执行费** + `tradingFee`（手续费按名义价值 × 费率计算，见 `utils.getUserTradingFeeRate`）。
- **已有持仓（加仓，`positionId` 非空）**：同上，但**不含**「预留爆仓执行费」项。

单笔执行费基数可通过 `myxClient.utils.getNetworkFee(marketId, chainId)` 取得；若一笔单涉及多笔执行费，业务侧需**先汇总**再参与上式。

**`createIncreaseOrder` 的第二个参数 `networkFee`**：类型为**字符串**，表示你已汇总的**链上执行费（network fee）**总额；SDK 内部用 `needAmount = collateralAmount + networkFee` 与 `getAvailableMarginBalance` 比较，计算是否需要 `deposit`。**`tradingFee` 不传入该第二个参数**，应在产品侧合并进业务校验或与合约规则对齐。

**平仓（`createDecreaseOrder` / `closeAllPositions`）**

- **部分平仓**：需覆盖平仓执行费；若剩余保证金不足以支付本次网络执行费，需补足缺口（见全量文档）。
- **全部平仓**：保证金总量为 0；`closeAllPositions` 内部 `deposit` 为 0。

**Deposit**：若可用保证金不足，`depositAmount ≈ max(0, 需占用总量 - 当前可用保证金)`（与链上精度一致）。

### createIncreaseOrder

创建增仓订单（开仓或加仓）。方法签名为 **`createIncreaseOrder(params, networkFee)`**，共 **两个参数**。

```typescript
import { OrderType, TriggerType, Direction, TimeInForce } from '@myx-trade/sdk';

// 示例：networkFee 为业务侧按市场规则汇总后的执行费字符串（非 tradingFee）
const networkFee = '...'; // e.g. sum of execution fee legs for open / TP / SL / liquidation reserve as applicable

const result = await myxClient.order.createIncreaseOrder(
  {
    chainId: 421614,
    address: userAddress as `0x${string}`,
    poolId: poolId, // 从市场列表获取的 Pool ID
    positionId: "", // 新仓位使用 ''；已有仓位使用现有的 positionId
    orderType: OrderType.LIMIT,
    triggerType: TriggerType.NONE,
    direction: Direction.LONG,
    collateralAmount: "1000000000", // 报价代币精度
    size: "1000000000000000000", // 仓位大小
    price: "3000000000000000000000000000000000", // 30 位小数
    timeInForce: TimeInForce.IOC,
    postOnly: false,
    slippagePct: "100", // 基点（bps）
    executionFeeToken: quoteTokenAddress, // 报价代币地址（例如 USDC）
    leverage: 10,
    tpSize: "0", // 可选：止盈大小
    tpPrice: "0", // 可选：止盈价格
    slSize: "0", // 可选：止损大小
    slPrice: "0", // 可选：止损价格
  },
  networkFee, // 字符串：汇总后的链上执行费（见上文「保证金、执行费与 Deposit」）
);
```

### createDecreaseOrder

创建减仓订单（平仓或减仓）。

```typescript
const result = await myxClient.order.createDecreaseOrder({
  chainId: 421614,
  address: userAddress as `0x${string}`,
  poolId: poolId,
  positionId: existingPositionId,
  orderType: OrderType.MARKET,
  triggerType: TriggerType.NONE,
  direction: Direction.SHORT,
  collateralAmount: "0",
  size: "500000000000000000",
  price: "3000000000000000000000000000000000",
  timeInForce: TimeInForce.IOC,
  postOnly: false,
  slippagePct: "100",
  executionFeeToken: quoteTokenAddress,
  leverage: 10,
});
```

`collateralAmount` 等与是否需从钱包追加保证金（Deposit）有关，规则见本节开头「保证金、执行费与 Deposit」。

### closeAllPositions

一次性关闭池中的所有仓位。

```typescript
const result = await myxClient.order.closeAllPositions(
  421614, // chainId
  [
    { /* 仓位 1 的 PlaceOrderParams */ },
    { /* 仓位 2 的 PlaceOrderParams */ },
  ]
);
```

### createPositionTpSlOrder

为现有仓位创建止盈和/或止损订单。

```typescript
import { TriggerType, Direction } from '@myx-trade/sdk';

await myxClient.order.createPositionTpSlOrder({
  chainId: 421614,
  address: userAddress as `0x${string}`,
  poolId: poolId,
  positionId: existingPositionId,
  direction: Direction.LONG,
  leverage: 10,
  tpSize: "100000000000000000",
  tpPrice: "3500000000000000000000000000000000",
  tpTriggerType: TriggerType.GTE,
  slSize: "100000000000000000",
  slPrice: "2800000000000000000000000000000000",
  slTriggerType: TriggerType.LTE,
  executionFeeToken: quoteTokenAddress,
  slippagePct: "100", // 基点（bps）
});
```

### updateOrderTpSl

更新现有订单的止盈和止损。

```typescript
await myxClient.order.updateOrderTpSl(
  {
    orderId: orderId,
    size: "1000000000000000000",
    price: "3000000000000000000000000000000000",
    tpSize: "500000000000000000",
    tpPrice: "3500000000000000000000000000000000",
    slSize: "500000000000000000",
    slPrice: "2800000000000000000000000000000000",
    useOrderCollateral: true,
    executionFeeToken: quoteTokenAddress,
  },
  quoteTokenAddress,
  chainId,
  userAddress,
  marketId,   // 市场 ID
  true        // 可选：是否为 TpSl 订单，默认 undefined
);
```

### cancelOrder

取消单个订单。

```typescript
await myxClient.order.cancelOrder(orderId, chainId);
```

### cancelOrders

取消多个订单。

```typescript
await myxClient.order.cancelOrders([orderId1, orderId2, orderId3], chainId);
```

### cancelAllOrders

取消所有未成交订单。

```typescript
await myxClient.order.cancelAllOrders([orderId1, orderId2, orderId3], chainId);
```

### getOrders

获取当前账户的所有未成交订单。

```typescript
const result = await myxClient.order.getOrders(userAddress);
if (result.code === 0) {
  console.log(result.data); // 未成交订单数组
}
```

### getOrderHistory

获取历史订单。

```typescript
const result = await myxClient.order.getOrderHistory(
  {
    chainId: 421614,
    poolId: poolId, // 可选：按池过滤
    limit: 20,
  },
  userAddress
);
```

## 模块：持仓（Position）

### listPositions

获取当前账户的所有未平仓位。

```typescript
const result = await myxClient.position.listPositions(userAddress);
if (result.code === 0) {
  const positions = result.data;
  // positions 数组包含所有未平仓位
}
```

### getPositionHistory

获取历史已平仓位。

```typescript
const result = await myxClient.position.getPositionHistory(
  {
    chainId: 421614,
    poolId: poolId, // 可选：按池过滤
    limit: 20,
  },
  userAddress
);
```

### adjustCollateral

增加或减少仓位的保证金。

```typescript
import { OracleType } from '@myx-trade/sdk';

await myxClient.position.adjustCollateral({
  poolId: poolId,
  positionId: positionId,
  adjustAmount: "100000000", // 正数为增加，负数为减少
  quoteToken: quoteTokenAddress,
  poolOracleType: OracleType.Pyth,
  chainId: 421614,
  address: userAddress,
});
```

## 模块：工具（Utils）

### needsApproval

检查是否需要代币授权。

```typescript
const needApproval = await myxClient.utils.needsApproval(
  userAddress,
  chainId,
  quoteTokenAddress,
  amount
);
```

### approveAuthorization

授权代币支出。

```typescript
const result = await myxClient.utils.approveAuthorization({
  chainId: chainId,
  quoteAddress: quoteTokenAddress,
  amount: ethers.MaxUint256.toString(),
});
```

### getUserTradingFeeRate

获取用户的交易费率。

```typescript
const result = await myxClient.utils.getUserTradingFeeRate(
  assetClass,
  riskTier,
  chainId
);
// 返回：{ takerFeeRate, makerFeeRate, baseTakerFeeRate, baseMakerFeeRate }
```

### getNetworkFee

获取订单的网络执行费用。

```typescript
const networkFee = await myxClient.utils.getNetworkFee(marketId, chainId);
```

### getOraclePrice

获取池的预言机价格。

```typescript
const priceData = await myxClient.utils.getOraclePrice(poolId, chainId);
// 返回：{ price, vaa, publishTime, poolId, value }
```

### checkSeamlessGas

检查无 Gas 账户是否有足够的 gas。

```typescript
const hasEnoughGas = await myxClient.utils.checkSeamlessGas(userAddress, chainId);
```

### getLiquidityInfo

获取池的流动性信息。

```typescript
const result = await myxClient.utils.getLiquidityInfo({
  chainId: chainId,
  poolId: poolId,
  marketPrice: marketPrice, // 30 位小数
});
```

### formatErrorMessage

格式化合约调用的错误消息。

```typescript
const errorMsg = myxClient.utils.formatErrorMessage(error);
```

### getGasPriceByRatio

获取配置比例的 gas 价格（使用当前客户端配置的 chainId）。

```typescript
const gasPrice = await myxClient.utils.getGasPriceByRatio();
```

### getGasLimitByRatio

根据预估 gas 按配置比例计算 gas 限制。

```typescript
const gasLimit = await myxClient.utils.getGasLimitByRatio(BigInt(100000));
```

## 模块：市场（Markets）

### getPoolLevelConfig

获取池级别配置。

```typescript
const poolConfig = await myxClient.markets.getPoolLevelConfig(poolId, chainId);
```

### getKlineList

获取 K 线/蜡烛图数据。

```typescript
const klines = await myxClient.markets.getKlineList({
  poolId: poolId,
  chainId: chainId,
  interval: '1h', // '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'
  limit: 100,
  endTime: Date.now(),
});
```

### getKlineLatestBar

获取最新的 K 线柱。

```typescript
const latestBar = await myxClient.markets.getKlineLatestBar({
  poolId: poolId,
  chainId: chainId,
  interval: '1h',
});
```

### getTickerList

获取多个池的行情数据。

```typescript
const tickers = await myxClient.markets.getTickerList({
  chainId: chainId,
  poolIds: [poolId1, poolId2],
});
```

### searchMarket

搜索市场（无需认证）。

```typescript
const results = await myxClient.markets.searchMarket({
  chainId: chainId,
  keyword: "BTC",
  limit: 10,
});
```

### searchMarketAuth

搜索市场（需要认证，显示收藏）。

```typescript
const results = await myxClient.markets.searchMarketAuth({
  chainId: chainId,
  keyword: "BTC",
  limit: 10,
}, userAddress);
```

### getFavoritesList

获取用户的收藏市场。

```typescript
const favorites = await myxClient.markets.getFavoritesList({
  chainId: chainId,
  page: 1,
  limit: 20,
}, userAddress);
```

### addFavorite

将市场添加到收藏。

```typescript
await myxClient.markets.addFavorite({
  chainId: chainId,
  poolId: poolId,
}, userAddress);
```

### removeFavorite

从收藏中移除市场。

```typescript
await myxClient.markets.removeFavorite({
  chainId: chainId,
  poolId: poolId,
}, userAddress);
```

### getBaseDetail

获取基础代币详情。

```typescript
const baseDetail = await myxClient.markets.getBaseDetail({
  chainId: chainId,
  baseAddress: baseTokenAddress,
});
```

### getMarketDetail

获取市场详细信息。

```typescript
const marketDetail = await myxClient.markets.getMarketDetail({
  chainId: chainId,
  poolId: poolId,
});
```

### getPoolSymbolAll

获取所有池的符号。

```typescript
const pools = await myxClient.markets.getPoolSymbolAll();
```

## 模块：账户（Account）

### getWalletQuoteTokenBalance

获取钱包的报价代币余额。

```typescript
const result = await myxClient.account.getWalletQuoteTokenBalance({
  chainId,
  address: userAddress,      // 可选，不传则读取当前 signer 地址
  tokenAddress: quoteTokenAddress,
});
console.log(result.data); // 余额（wei）
```

### getAvailableMarginBalance

获取池的可用保证金余额。

```typescript
const availableBalance = await myxClient.account.getAvailableMarginBalance({
  poolId: poolId,
  chainId: chainId,
  address: userAddress,
});
```

### getTradeFlow

获取账户交易流水历史。

```typescript
const result = await myxClient.account.getTradeFlow(
  {
    chainId: chainId,
    limit: 20,
    poolId: poolId, // 可选
  },
  userAddress
);
```

### deposit

向交易账户存入资金。

```typescript
const result = await myxClient.account.deposit({
  amount: amount,
  tokenAddress: quoteTokenAddress,
  chainId: chainId,
});
```

### updateAndWithdraw

从交易账户提取资金。

```typescript
const result = await myxClient.account.updateAndWithdraw(
  userAddress, // receiver
  poolId,
  true,        // isQuoteToken
  amount,
  chainId
);
```

### getAccountInfo

获取池的账户信息。

```typescript
const result = await myxClient.account.getAccountInfo(chainId, userAddress, poolId);
// 返回：{ freeMargin, quoteProfit, ... }
```

### getAccountVipInfo

从链上获取账户 VIP 信息。

```typescript
const result = await myxClient.account.getAccountVipInfo(chainId, userAddress);
// 返回：{ tier, referrer, totalReferralRebatePct, referrerRebatePct, nonce, deadline }
```

### getAccountVipInfoByBackend

从后端获取账户 VIP 信息。

```typescript
const result = await myxClient.account.getAccountVipInfoByBackend(
  userAddress,
  chainId,
  deadline,
  nonce
);
```

### setUserFeeData

使用后端签名设置用户费用数据。

```typescript
const result = await myxClient.account.setUserFeeData(
  userAddress,
  chainId,
  deadline,
  {
    tier: 1,
    referrer: referrerAddress,
    totalReferralRebatePct: 1000,
    referrerRebatePct: 500,
    nonce: nonce,
  },
  signature
);
```

## 模块：无 Gas 交易（Seamless）

无 Gas 交易相关能力。

### onCheckRelayer

检查某个 seamless 地址是否已被 master 账户授权，同时检查是否仍需要做代币授权。

```typescript
const ok = await myxClient.seamless.onCheckRelayer(
  userAddress,            // master account
  seamlessWalletAddress,  // relayer/seamless address
  chainId,
  quoteTokenAddress
);
```

### getUSDPermitParams

生成用于 forwarder 授权的 permit 参数（高级用法）。

```typescript
const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
const permitParams = await myxClient.seamless.getUSDPermitParams(
  deadline,
  chainId,
  quoteTokenAddress
);
```

### authorizeSeamlessAccount

授权或撤销 seamless 账户（主流程方法）。

```typescript
const result = await myxClient.seamless.authorizeSeamlessAccount({
  approve: true, // false 为撤销
  seamlessAddress: seamlessWalletAddress,
  chainId,
  forwardFeeToken: quoteTokenAddress,
});
```

### forwarderTx

发送 forwarder 交易（高级用法，通常由 SDK 内部流程调用）。

```typescript
const result = await myxClient.seamless.forwarderTx(
  {
    from: userAddress,
    to: targetContract,
    value: "0",
    gas: "800000",
    deadline,
    data: encodedCallData,
    nonce: "0",
    forwardFeeToken: quoteTokenAddress,
  },
  chainId
);
```

### getOriginSeamlessAccount

通过 seamless 地址查询其主账户地址。

```typescript
const result = await myxClient.seamless.getOriginSeamlessAccount(
  seamlessWalletAddress,
  chainId
);
// 返回：{ masterAddress }
```

## 模块：推荐返佣（Referrals）

### claimRebate

领取推荐返佣。

```typescript
const receipt = await myxClient.referrals.claimRebate(
  tokenAddress // 领取返佣的代币地址
);
```

## 模块：LP（流动性提供者）

LP 模块为流动性提供者提供管理池流动性的功能。

### 池管理

#### pool.createPool

创建新的流动性池。

```typescript
import { pool } from '@myx-trade/sdk';

const poolId = await pool.createPool({
  chainId: chainId,
  baseToken: baseTokenAddress,
  marketId: marketId,
});
```

**参数：**
```typescript
interface CreatePoolRequest {
  chainId: ChainId;
  baseToken: AddressLike;
  marketId: string;
}
```

#### pool.getPoolDetail

获取池的详细信息。

```typescript
const detail = await pool.getPoolDetail(poolId);
```

#### pool.getMarketPoolId

获取特定市场的池 ID。

```typescript
const poolId = await pool.getMarketPoolId({
  chainId: chainId,
  baseToken: baseTokenAddress,
  marketId: marketId,
});
```

#### pool.getMarketPools

获取市场的所有池。

```typescript
const pools = await pool.getMarketPools({
  chainId: chainId,
  marketId: marketId,
});
```

#### pool.getPoolInfo

获取池信息。

```typescript
const info = await pool.getPoolInfo(chainId, poolId);
```

#### pool.getUserGenesisShare

获取用户在池中的创世份额。

```typescript
const share = await pool.getUserGenesisShare({
  chainId: chainId,
  poolId: poolId,
  account: userAddress,
});
```

#### pool.addTpSl

为 LP 仓位添加止盈/止损订单。

```typescript
import { PoolType, TriggerType } from '@myx-trade/sdk';

await pool.addTpSl({
  chainId: chainId,
  poolId: poolId,
  poolType: PoolType.Quote, // PoolType.Quote 或 PoolType.Base
  slippage: 0.01,
  tpsl: [
    {
      amount: 100,
      triggerPrice: 3500,
      triggerType: TriggerType.TP,
    },
    {
      amount: 100,
      triggerPrice: 2800,
      triggerType: TriggerType.SL,
    },
  ],
});
```

**参数：**
```typescript
enum PoolType {
  Base = 0,
  Quote = 1
}

enum TriggerType {
  TP = 1,  // 止盈
  SL = 2,  // 止损
}

interface TpSl {
  amount: number;
  triggerPrice: number;
  triggerType: TriggerType;
}

interface AddTpSLParams {
  chainId: ChainId;
  poolId: string;
  poolType: PoolType;
  slippage: number;
  tpsl: TpSl[];
}
```

#### pool.cancelTpSl

取消止盈/止损订单。

```typescript
await pool.cancelTpSl({
  chainId: chainId,
  orderId: orderId,
});
```

#### pool.reprime

重新启动池。

```typescript
await pool.reprime({
  chainId: chainId,
  poolId: poolId,
});
```

#### pool.getOpenOrders

获取未成交的 LP 订单。

```typescript
const orders = await pool.getOpenOrders({
  chainId: chainId,
  poolId: poolId,
  account: userAddress,
});
```

### Quote 池操作

#### quote.deposit

存入报价代币（如 USDC）提供流动性。

```typescript
import { quote } from '@myx-trade/sdk';

const tx = await quote.deposit({
  chainId: chainId,
  poolId: poolId,
  amount: 2000,
  slippage: 0.01,
  tpsl: [  // 可选
    {
      triggerPrice: 3500,
      triggerType: TriggerType.TP,
    },
  ],
});
```

**参数：**
```typescript
interface Deposit {
  chainId: ChainId;
  poolId: string;
  amount: number;
  slippage: number;
  tpsl?: DepositTpSl[];  // 可选的止盈/止损
}

type DepositTpSl = Pick<TpSl, 'triggerType' | 'triggerPrice'>;
```

#### quote.withdraw

从池中提取报价代币。

```typescript
const tx = await quote.withdraw({
  chainId: chainId,
  poolId: poolId,
  amount: 1000,
  slippage: 0.01,
});
```

**参数：**
```typescript
interface WithdrawParams {
  chainId: ChainId;
  poolId: string;
  amount: number;
  slippage: number;
}
```

#### quote.transfer

转移 Quote LP 代币。

```typescript
const tx = await quote.transfer({
  chainId: chainId,
  poolId: poolId,
  recipient: recipientAddress,
  amount: amount,
});
```

#### quote.getLpPrice

获取 Quote LP 代币的当前价格。

```typescript
const price = await quote.getLpPrice(chainId, poolId);
```

#### quote.getRewards

获取 Quote LP 的待领取奖励。

```typescript
const rewards = await quote.getRewards({
  chainId: chainId,
  poolId: poolId,
  account: userAddress,
});
```

**参数：**
```typescript
interface RewardsParams {
  chainId: ChainId;
  poolId: string;
  account: string;
}
```

#### quote.claimQuotePoolRebate

从单个 Quote 池领取返佣。

```typescript
const tx = await quote.claimQuotePoolRebate({
  chainId: chainId,
  poolId: poolId,
});
```

**参数：**
```typescript
interface ClaimParams {
  chainId: ChainId;
  poolId: string;
}
```

#### quote.claimQuotePoolRebates

从多个 Quote 池领取返佣。

```typescript
const tx = await quote.claimQuotePoolRebates({
  chainId: chainId,
  poolIds: [poolId1, poolId2, poolId3],
});
```

**参数：**
```typescript
interface ClaimRebatesParams {
  chainId: ChainId;
  poolIds: string[];
}
```

### Base 池操作

#### base.deposit

存入基础代币提供流动性。

```typescript
import { base } from '@myx-trade/sdk';

const tx = await base.deposit({
  chainId: chainId,
  poolId: poolId,
  amount: 0.01,
  slippage: 0.01,
  tpsl: [  // 可选
    {
      triggerPrice: 3500,
      triggerType: TriggerType.TP,
    },
  ],
});
```

#### base.withdraw

从池中提取基础代币。

```typescript
const tx = await base.withdraw({
  chainId: chainId,
  poolId: poolId,
  amount: 0.005,
  slippage: 0.01,
});
```

#### base.getLpPrice

获取 Base LP 代币的当前价格。

```typescript
const price = await base.getLpPrice(chainId, poolId);
```

#### base.getRewards

获取 Base LP 的待领取奖励。

```typescript
const rewards = await base.getRewards({
  chainId: chainId,
  poolId: poolId,
  account: userAddress,
});
```

#### base.claimBasePoolRebate

从单个 Base 池领取返佣。

```typescript
const tx = await base.claimBasePoolRebate({
  chainId: chainId,
  poolId: poolId,
});
```

#### base.claimBasePoolRebates

从多个 Base 池领取返佣。

```typescript
const tx = await base.claimBasePoolRebates({
  chainId: chainId,
  poolIds: [poolId1, poolId2, poolId3],
});
```

#### base.previewUserWithdrawData

在执行前预览提取数据。

```typescript
const withdrawData = await base.previewUserWithdrawData({
  chainId: chainId,
  poolId: poolId,
  account: userAddress,
  amount: amount,
});
```

**参数：**
```typescript
interface PreviewWithdrawDataParams {
  chainId: ChainId;
  poolId: string;
  account: string;
  amount: string | number;
}
```

### 市场操作

#### market.getMarket

获取市场信息。

```typescript
import { market } from '@myx-trade/sdk';

const marketInfo = await market.getMarket(chainId);
```

#### market.getOracleFee

获取价格更新的预言机费用。

```typescript
const oracleFee = await market.getOracleFee(chainId, poolId);
```

### 工具函数

LP 模块还导出了有用的工具函数：

```typescript
import { 
  formatUnits, 
  parseUnits, 
  COMMON_PRICE_DECIMALS, 
  COMMON_LP_AMOUNT_DECIMALS 
} from '@myx-trade/sdk';

// 从 wei 格式化为可读格式
const formattedAmount = formatUnits(bigIntAmount, decimals);

// 从可读格式解析为 wei
const weiAmount = parseUnits("100", decimals);

// 常用精度常量
console.log(COMMON_PRICE_DECIMALS);       // 价格精度（30）
console.log(COMMON_LP_AMOUNT_DECIMALS);   // LP 代币精度
```

### 完整 LP 示例

```typescript
import { pool, quote, base, formatUnits } from '@myx-trade/sdk';

// 创建池
const poolId = await pool.createPool({
  chainId: 421614,
  baseToken: baseTokenAddress,
  marketId: marketId,
});

// 获取池详情
const detail = await pool.getPoolDetail(poolId);

// 存入报价代币（USDC）
await quote.deposit({
  chainId: 421614,
  poolId,
  amount: 2000,
  slippage: 0.01,
});

// 存入基础代币
await base.deposit({
  chainId: 421614,
  poolId,
  amount: 0.01,
  slippage: 0.01,
});

// 检查 LP 代币价格
const quoteLpPrice = await quote.getLpPrice(421614, poolId);
const baseLpPrice = await base.getLpPrice(421614, poolId);

// 检查奖励
const quoteRewards = await quote.getRewards({
  chainId: 421614,
  poolId,
  account: userAddress,
});

// 领取奖励
await quote.claimQuotePoolRebate({
  chainId: 421614,
  poolId,
});

// 提取流动性
await quote.withdraw({
  chainId: 421614,
  poolId,
  amount: 1000,
  slippage: 0.01,
});
```

## 模块：订阅（Subscription）- WebSocket

订阅模块通过 WebSocket 提供市场数据、订单和仓位的实时更新。

### 连接管理

```typescript
// 连接到 WebSocket
myxClient.subscription.connect();

// 断开 WebSocket 连接
myxClient.subscription.disconnect();

// 重新连接 WebSocket
myxClient.subscription.reconnect();

// 检查连接状态
const isConnected = myxClient.subscription.isConnected;
```

### 公开订阅（无需认证）

#### subscribeTickers / unsubscribeTickers

订阅一个或多个池的行情更新。

```typescript
const onTickers = (data) => {
  console.log('行情更新:', data);
  // data: { type: 'ticker', globalId: number, data: { C, E, T, h, i, l, p, v } }
};

// 订阅单个池
myxClient.subscription.subscribeTickers(globalId, onTickers);

// 订阅多个池
myxClient.subscription.subscribeTickers([globalId1, globalId2, globalId3], onTickers);

// 取消订阅
myxClient.subscription.unsubscribeTickers(globalId, onTickers);
myxClient.subscription.unsubscribeTickers([globalId1, globalId2], onTickers);
```

#### subscribeKline / unsubscribeKline

订阅 K 线/蜡烛图更新。

```typescript
const onKline = (data) => {
  console.log('K线更新:', data);
  // data: { type: 'candle', globalId, resolution, data: { E, T, c, h, l, o, t, v } }
};

// 订阅
myxClient.subscription.subscribeKline(globalId, '1m', onKline);
// 分辨率: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

// 取消订阅
myxClient.subscription.unsubscribeKline(globalId, '1m', onKline);
```

### 私有订阅（需要认证）

私有订阅需要认证。在订阅前调用 `auth()`。

#### auth

对 WebSocket 连接进行认证。

```typescript
await myxClient.subscription.auth();
```

#### subscribeOrder / unsubscribeOrder

订阅已认证账户的订单更新。

```typescript
const onOrder = (data) => {
  console.log('订单更新:', data);
  // 当订单被创建、成交、取消等时接收更新
};

await myxClient.subscription.subscribeOrder(onOrder);

// 取消订阅
myxClient.subscription.unsubscribeOrder(onOrder);
```

#### subscribePosition / unsubscribePosition

订阅已认证账户的仓位更新。

```typescript
const onPosition = (data) => {
  console.log('仓位更新:', data);
  // 当仓位被开启、修改或关闭时接收更新
};

await myxClient.subscription.subscribePosition(onPosition);

// 取消订阅
myxClient.subscription.unsubscribePosition(onPosition);
```

### 事件监听

监听 WebSocket 连接事件。

```typescript
// 连接打开
myxClient.subscription.on('open', () => {
  console.log('WebSocket 已连接');
});

// 连接关闭
myxClient.subscription.on('close', () => {
  console.log('WebSocket 已关闭');
});

// 连接错误
myxClient.subscription.on('error', (error) => {
  console.error('WebSocket 错误:', error);
});

// 重新连接中
myxClient.subscription.on('reconnecting', ({ detail }) => {
  console.log('正在重新连接...', detail);
});

// 达到最大重连次数
myxClient.subscription.on('maxreconnectattempts', () => {
  console.log('已达到最大重连次数');
});

// 移除事件监听器
const handler = () => console.log('已打开');
myxClient.subscription.on('open', handler);
myxClient.subscription.off('open', handler);
```

### 完整示例

```typescript
// 连接并订阅公开数据
myxClient.subscription.connect();

// 订阅行情
const tickerCallback = (data) => {
  console.log('行情:', data.globalId, data.data);
};
myxClient.subscription.subscribeTickers([1, 2, 3], tickerCallback);

// 订阅K线
const klineCallback = (data) => {
  console.log('K线:', data.globalId, data.resolution, data.data);
};
myxClient.subscription.subscribeKline(1, '1h', klineCallback);

// 认证并订阅私有数据
await myxClient.subscription.auth();

// 订阅订单
const orderCallback = (data) => {
  console.log('订单更新:', data);
};
await myxClient.subscription.subscribeOrder(orderCallback);

// 订阅仓位
const positionCallback = (data) => {
  console.log('仓位更新:', data);
};
await myxClient.subscription.subscribePosition(positionCallback);

// 清理
myxClient.subscription.unsubscribeTickers([1, 2, 3], tickerCallback);
myxClient.subscription.unsubscribeKline(1, '1h', klineCallback);
myxClient.subscription.unsubscribeOrder(orderCallback);
myxClient.subscription.unsubscribePosition(positionCallback);
myxClient.subscription.disconnect();
```

## 类型参考

### 枚举

```typescript
// 订单类型
export const OrderType = {
  MARKET: 0,      // 市价单
  LIMIT: 1,       // 限价单
  STOP: 2,        // 止损单
  CONDITIONAL: 3  // 条件单
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

// 触发类型
export const TriggerType = {
  NONE: 0,  // 无触发
  GTE: 1,   // 大于等于 (>=)
  LTE: 2    // 小于等于 (<=)
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

// 操作类型
export const OperationType = {
  INCREASE: 0,  // 增仓
  DECREASE: 1   // 减仓
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

// 方向
export const Direction = {
  LONG: 0,   // 做多
  SHORT: 1   // 做空
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

// 时效类型
export const TimeInForce = {
  IOC: 0  // 立即成交或取消
} as const;
export type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];
```

### 接口

```typescript
// 下单参数
export interface PlaceOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: string;
  orderType: OrderType;
  triggerType: TriggerType;
  direction: Direction;
  collateralAmount: string;  // 报价代币精度
  size: string;              // 仓位大小
  price: string;             // 30 位小数
  timeInForce: TimeInForce;
  postOnly: boolean;
  slippagePct: string;       // 基点（bps）
  executionFeeToken: string;
  leverage: number;
  tpSize?: string;           // 可选：止盈大小
  tpPrice?: string;          // 可选：止盈价格（30 位小数）
  slSize?: string;           // 可选：止损大小
  slPrice?: string;          // 可选：止损价格（30 位小数）
}

// 仓位止盈止损
export interface PositionTpSlOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: '';
  executionFeeToken: string;
  tpTriggerType: TriggerType;
  slTriggerType: TriggerType;
  direction: Direction;      // 仓位方向
  leverage: number;
  tpSize?: string;           // 止盈大小
  tpPrice?: string;          // 止盈价格（30 位小数）
  slSize?: string;           // 止损大小
  slPrice?: string;          // 止损价格（30 位小数）
}

// 更新订单止盈止损
export interface UpdateOrderParams {
  orderId: string;
  size: string;
  price: string;             // 30 位小数
  tpSize: string;
  tpPrice: string;           // 30 位小数
  slSize: string;
  slPrice: string;           // 30 位小数
  useOrderCollateral: boolean;
  executionFeeToken: string;
}

// 历史查询参数
export interface GetHistoryOrdersParams {
  chainId: number;
  poolId?: string;
  page: number;
  limit: number;
}
```

### WebSocket 类型

```typescript
// K线分辨率
export type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// 行情数据
export interface TickersDataResponse {
  type: 'ticker';
  globalId: number;
  data: {
    C: string;  // 收盘价
    E: number;  // 事件时间
    T: string;  // 时间戳
    h: string;  // 最高价
    i: string;  // 指数价格
    l: string;  // 最低价
    p: string;  // 价格变化百分比
    v: string;  // 成交量
  };
}

// K线数据
export interface KlineDataResponse {
  type: 'candle';
  globalId: number;
  resolution: KlineResolution;
  data: {
    E: number;  // 事件时间
    T: string;  // 时间戳
    c: string;  // 收盘价
    h: string;  // 最高价
    l: string;  // 最低价
    o: string;  // 开盘价
    t: number;  // 时间
    v: string;  // 成交量
  };
}
```

### 客户端配置

```typescript
export interface MyxClientConfig {
  chainId: number;                    // 链 ID（测试网 421614）
  signer?: ethers.Signer;             // Ethers signer
  walletClient?: any;                 // Wagmi 钱包客户端
  brokerAddress: string;              // Broker 合约地址
  isTestnet?: boolean;                // true 为测试网，false 为 Beta（默认：false）
  isBetaMode?: boolean;               // true 为 Beta 环境（默认：false）
  seamlessMode?: boolean;             // 启用无 Gas 模式（默认：false）
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none'; // 日志级别（默认：'info'）
  socketConfig?: {
    reconnectInterval?: number;       // WebSocket 重连间隔（毫秒）（默认：5000）
    maxReconnectAttempts?: number;    // 最大重连次数（默认：5）
  };
  getAccessToken?: () => Promise<{   // 可选：访问令牌获取函数
    code: number;
    msg: string | null;
    data: {
      accessToken: string;
      expireAt: number;
      allowAccount: string;
      appId: string;
    };
  }>;
}
```

## 错误处理

### AccessToken 管理

SDK 自动管理 AccessToken。如果令牌过期（错误代码 9401），请再次调用 `handleAccessToken()`：

```typescript
try {
  const orders = await myxClient.order.getOrders(userAddress);
} catch (error) {
  if (error.code === 9401) {
    await handleAccessToken();
    // 重试请求
    const orders = await myxClient.order.getOrders(userAddress);
  }
}
```

### 交易错误

SDK 提供错误格式化工具：

```typescript
try {
  await myxClient.order.createIncreaseOrder(params, networkFee);
} catch (error) {
  const errorMessage = myxClient.utils.formatErrorMessage(error);
  console.error('交易失败:', errorMessage);
}
```

### 常见错误代码

- `9401`: AccessToken 过期
- `9403`: 未授权
- `-1`: 一般错误（查看消息了解详情）
- `0`: 成功

## 最佳实践

### 1. 价格和数量精度

- **价格**: 使用 30 位小数（例如：`"3000000000000000000000000000000000"` 表示 $3000）
- **数量**: 使用代币精度（通常 USDC 为 6 位，ETH 为 18 位）
- **滑点**: 以基点为单位（100 = 1%）

```typescript
import { ethers } from 'ethers';

// 将价格转换为 30 位小数
const price = ethers.parseUnits("3000", 30).toString();

// 将数量转换为代币精度
const amount = ethers.parseUnits("100", 6).toString(); // 100 USDC
```

### 2. 交易前检查授权

```typescript
const needApproval = await myxClient.utils.needsApproval(
  userAddress,
  chainId,
  quoteTokenAddress,
  collateralAmount
);

if (needApproval) {
  await myxClient.utils.approveAuthorization({
    chainId,
    quoteAddress: quoteTokenAddress,
    amount: ethers.MaxUint256.toString(),
  });
}
```

### 3. 计算交易费用

```typescript
const feeRate = await myxClient.utils.getUserTradingFeeRate(
  assetClass,
  riskTier,
  chainId
);

const tradingFee = (BigInt(collateralAmount) * BigInt(feeRate.data.takerFeeRate)) / BigInt(1e6);
```

### 4. 监控 WebSocket 连接

```typescript
myxClient.subscription.on('close', () => {
  console.log('WebSocket 已关闭，正在重新连接...');
  myxClient.subscription.reconnect();
});

myxClient.subscription.on('error', (error) => {
  console.error('WebSocket 错误:', error);
});
```

### 5. 使用无 Gas 模式提升用户体验

无 Gas 模式允许无 gas 费交易，提供更好的用户体验：

```typescript
// 授权 seamless 账户（当前可用流程）
await myxClient.seamless.authorizeSeamlessAccount({
  approve: true,
  seamlessAddress: seamlessWalletAddress,
  chainId,
  forwardFeeToken: quoteTokenAddress,
});

// 可选：检查授权与代币授权状态
const ready = await myxClient.seamless.onCheckRelayer(
  userAddress,
  seamlessWalletAddress,
  chainId,
  quoteTokenAddress
);
```

## 依赖项

```json
{
  "dependencies": {
    "@myx-trade/sdk": "latest",
    "ethers": "^6.x.x",
    "crypto-es": "^3.x.x"
  }
}
```

## 网络配置

### 环境配置示例

```typescript
// 测试网
const testnetClient = new MyxClient({
  chainId: 421614,
  signer,
  brokerAddress: TESTNET_BROKER_ADDRESS,
  isTestnet: true,
  isBetaMode: false,
});

// Beta
const betaClient = new MyxClient({
  chainId: BETA_CHAIN_ID,
  signer,
  brokerAddress: BETA_BROKER_ADDRESS,
  isTestnet: false,
  isBetaMode: true,
});
```

> **注意**: 请联系 MYX 团队获取各环境的具体链 ID、Broker 地址和代币地址。

## 支持

如有问题、疑问或功能请求，请联系 MYX 团队。
