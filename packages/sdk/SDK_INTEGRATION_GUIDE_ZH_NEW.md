# MYX Trade SDK 集成指南

## 概述

MYX Trade SDK 是一个用于衍生品交易的 TypeScript/JavaScript SDK。它提供订单下单、持仓管理、市场数据、订阅、账户管理、无 Gas 钱包和 LP 操作等功能。

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

```typescript
import { MyxClient } from '@myx-trade/sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(walletClient.transport);
const signer = await provider.getSigner();

const myxClient = new MyxClient({
  chainId: 421614, // 测试网使用 421614，主网使用 42161
  signer,
  brokerAddress: BROKER_ADDRESS, // 从 MYX 团队获取
  isTestnet: true, // true 为测试网，false 为主网
  isBetaMode: false, // true 为 Beta 环境，false 为生产环境
});
```

### 更新客户端链

```typescript
// 切换到不同的链
myxClient.updateClientChainId(42161, NEW_BROKER_ADDRESS);
```

## 模块：订单（Order）

### createIncreaseOrder

创建增仓订单（开仓或加仓）。

```typescript
import { OrderType, TriggerType, Direction } from '@myx-trade/sdk';

const result = await myxClient.order.createIncreaseOrder({
  chainId: 421614,
  address: userAddress as `0x${string}`,
  poolId: poolId, // 从市场列表获取的 Pool ID
  positionId: "0", // 新仓位使用 0，已有仓位使用现有的 positionId
  orderType: OrderType.LIMIT,
  triggerType: TriggerType.NONE,
  direction: Direction.LONG,
  collateralAmount: "1000000000", // 报价代币精度
  size: "1000000000000000000", // 仓位大小
  price: "3000000000000000000000000000000000", // 30 位小数
  postOnly: false,
  slippagePct: "100", // 基点（bps）
  executionFeeToken: quoteTokenAddress, // 报价代币地址（例如 USDC）
  leverage: 10,
  tpSize: "0", // 可选：止盈大小
  tpPrice: "0", // 可选：止盈价格
  slSize: "0", // 可选：止损大小
  slPrice: "0", // 可选：止损价格
}, tradingFee);
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
  postOnly: false,
  slippagePct: "100",
  executionFeeToken: quoteTokenAddress,
  leverage: 10,
});
```

### closeAllPositions

一次性关闭池中的所有仓位。

```typescript
const result = await myxClient.order.closeAllPositions(
  421614, // chainId
  [
    { /* 仓位 1 的 PlaceOrderParams */ },
    { /* 仓位 2 的 PlaceOrderParams */ },
  ],
  tradingFee
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
});
```

### updateOrderTpSl

更新现有订单的止盈和止损。

```typescript
await myxClient.order.updateOrderTpSl({
  orderId: orderId,
  size: "1000000000000000000",
  price: "3000000000000000000000000000000000",
  tpSize: "500000000000000000",
  tpPrice: "3500000000000000000000000000000000",
  slSize: "500000000000000000",
  slPrice: "2800000000000000000000000000000000",
  useOrderCollateral: true,
  executionFeeToken: quoteTokenAddress,
}, quoteTokenAddress, chainId, userAddress);
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
const result = await myxClient.order.getOrderHistory({
  chainId: 421614,
  poolId: poolId, // 可选：按池过滤
  page: 1,
  limit: 20,
}, userAddress);
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
const result = await myxClient.position.getPositionHistory({
  chainId: 421614,
  poolId: poolId, // 可选：按池过滤
  page: 1,
  limit: 20,
}, userAddress);
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
const networkFee = await myxClient.utils.getNetworkFee(
  quoteTokenAddress,
  chainId
);
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

获取配置比例的 gas 价格。

```typescript
const gasPrice = await myxClient.utils.getGasPriceByRatio(chainId);
```

### getGasLimitByRatio

获取配置比例的 gas 限制。

```typescript
const gasLimit = await myxClient.utils.getGasLimitByRatio(chainId, BigInt(100000));
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
const result = await myxClient.account.getWalletQuoteTokenBalance(chainId, userAddress);
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
const result = await myxClient.account.getTradeFlow({
  chainId: chainId,
  page: 1,
  limit: 20,
}, userAddress);
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

### withdraw

从交易账户提取资金。

```typescript
const result = await myxClient.account.withdraw({
  chainId: chainId,
  receiver: userAddress,
  amount: amount,
  poolId: poolId,
  isQuoteToken: true,
});
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

无 Gas 模式允许用户使用中继账户进行交易而无需支付 gas 费用。

### createSeamless

创建新的无 Gas 钱包。

```typescript
const result = await myxClient.seamless.createSeamless({
  password: userPassword,
  chainId: chainId,
});
// 返回：{ masterAddress, seamlessAccount, authorized, apiKey }
```

### unLockSeamlessWallet

解锁现有的无 Gas 钱包。

```typescript
const result = await myxClient.seamless.unLockSeamlessWallet({
  masterAddress: userAddress,
  password: userPassword,
  apiKey: encryptedApiKey,
  chainId: chainId,
});
```

### authorizeSeamlessAccount

授权或撤销无 Gas 账户。

```typescript
const result = await myxClient.seamless.authorizeSeamlessAccount({
  approve: true, // false 为撤销
  seamlessAddress: seamlessWalletAddress,
  chainId: chainId,
});
```

### startSeamlessMode

启用或禁用无 Gas 模式。

```typescript
const result = await myxClient.seamless.startSeamlessMode({
  open: true, // false 为禁用
});
```

### exportSeamlessPrivateKey

导出无 Gas 钱包私钥。

```typescript
const result = await myxClient.seamless.exportSeamlessPrivateKey({
  password: userPassword,
  apiKey: encryptedApiKey,
});
// 返回：{ privateKey }
```

### importSeamlessPrivateKey

从私钥导入无 Gas 钱包。

```typescript
const result = await myxClient.seamless.importSeamlessPrivateKey({
  privateKey: privateKey,
  password: userPassword,
  chainId: chainId,
});
// 返回：{ masterAddress, seamlessAccount, authorized, apiKey }
```

## 模块：推荐返佣（Referrals）

### claimRebate

领取推荐返佣。

```typescript
const receipt = await myxClient.referrals.claimRebate(
  tokenAddress // 领取返佣的代币地址
);
```

## 模块：LP 管理

`pool`、`quote`、`base` 下的导出保持不变。

```typescript
import { pool, quote, base, formatUnits, COMMON_PRICE_DECIMALS } from '@myx-trade/sdk';

const poolId = await pool.createPool({ chainId: 421614, baseToken: tokenAddress });
const detail = await pool.getPoolDetail(poolId);
await quote.deposit({ chainId: 421614, poolId, amount: 2000, slippage: 0.01 });
await quote.withdraw({ chainId: 421614, poolId, amount: 2000, slippage: 0.01 });
await base.deposit({ chainId: 421614, poolId, amount: 0.01, slippage: 0.01 });
await base.withdraw({ chainId: 421614, poolId, amount: 0.01, slippage: 0.01 });
const qPrice = await quote.getLpPrice(421614, poolId);
const bPrice = await base.getLpPrice(421614, poolId);
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
  positionId: number;
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
  chainId: number;                    // 链 ID（测试网 421614，主网 42161）
  signer?: ethers.Signer;             // Ethers signer
  walletClient?: any;                 // Wagmi 钱包客户端
  brokerAddress: string;              // Broker 合约地址
  isTestnet?: boolean;                // true 为测试网，false 为主网（默认：false）
  isBetaMode?: boolean;               // true 为 Beta 环境，false 为生产环境（默认：false）
  seamlessMode?: boolean;             // 启用无 Gas 模式（默认：false）
  logLevel?: 'debug' | 'info' | 'warn' | 'error'; // 日志级别（默认：'info'）
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
  await myxClient.order.createIncreaseOrder(params, tradingFee);
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
// 创建无 Gas 钱包
const result = await myxClient.seamless.createSeamless({
  password: userPassword,
  chainId,
});

// 启用无 Gas 模式
await myxClient.seamless.startSeamlessMode({ open: true });

// 现在所有交易都将无需 gas 费
```

## 依赖项

```json
{
  "dependencies": {
    "@myx-trade/sdk": "latest",
    "ethers": "^6.x.x",
    "crypto-js": "^4.x.x"
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

// 主网
const mainnetClient = new MyxClient({
  chainId: 42161,
  signer,
  brokerAddress: MAINNET_BROKER_ADDRESS,
  isTestnet: false,
  isBetaMode: false,
});
```

> **注意**: 请联系 MYX 团队获取各环境的具体链 ID、Broker 地址和代币地址。

## 支持

如有问题、疑问或功能请求，请联系 MYX 团队。
