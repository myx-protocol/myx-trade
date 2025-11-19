# MYX Trade SDK 接入指南（再生成版）

## 概述

MYX Trade SDK 是一个面向衍生品交易的 TypeScript/JavaScript SDK，提供下单、仓位管理、订单管理、市场数据、订阅与 LP 操作等功能。

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
  chainId: 421614,
  signer,
  brokerAddress: "0xd3d5b9c4316468697D827389B79622F43BDF6483",
  isTestnet: true,
});
```

### 配置 Access Token（访问令牌）

```typescript
import CryptoJS from "crypto-js";

const getAccessToken = async (appId: string, timestamp: number, expireTime: number, allowAccount: string, signature: string) => {
  const rs = await fetch(`https://api-test.myx.cash/openapi/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`);
  const res = await rs.json();
  return { code: 0, msg: null, data: { accessToken: res.data.accessToken, expireAt: res.data.expireAt, allowAccount: res.data.allowAccount, appId } };
};

const handleAccessToken = async () => {
  const appId = "test1";
  const timestamp = Math.floor(Date.now() / 1000);
  const expireTime = 3600 * 24;
  const allowAccount = address;
  const secret = "69v9kHey9b746PseJ0TP";

  const signature = CryptoJS.SHA256(`${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`).toString(CryptoJS.enc.Hex);
  const ok = await myxClient.getConfigManager().callGetAccessToken(getAccessToken, [appId, timestamp, expireTime, address!, signature]);
  if (!ok) throw new Error("获取 access token 失败");
};
```

## 模块：订单（Orders）

### 创建加仓/减仓订单

```typescript
import { OrderType, OperationType, TriggerType, Direction } from '@myx-trade/sdk';

const common = {
  chainId: 421614,
  address: address as `0x${string}`,
  poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  positionId: 0,
  orderType: OrderType.LIMIT,
  triggerType: TriggerType.NONE,
  direction: Direction.LONG,
  collateralAmount: "1000000000",
  size: "1000000000000000000",
  price: "3000000000000000000000000000000000",
  postOnly: false,
  slippagePct: "100",
  executionFeeToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  leverage: 10,
  tpSize: "0",
  tpPrice: "0",
  slSize: "0",
  slPrice: "0",
};

const incRes = await myxClient.order.createIncreaseOrder(common);
const decRes = await myxClient.order.createDecreaseOrder({ ...common, positionId: 14, direction: Direction.SHORT });
```

### 为已有仓位创建止盈/止损

```typescript
import { TriggerType, Direction } from '@myx-trade/sdk';

await myxClient.order.createPositionTpSlOrder({
  chainId: 421614,
  address: address as `0x${string}`,
  poolId,
  positionId: 14,
  direction: Direction.LONG,
  tpSize: "100000000000000000",
  tpPrice: "1200000000000000000000000000000000",
  tpTriggerType: TriggerType.GTE,
  slSize: "100000000000000000",
  slPrice: "1000000000000000000000000000000000",
  slTriggerType: TriggerType.LTE,
  executionFeeToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
});
```

### 更新订单 TP/SL

```typescript
await myxClient.order.updateOrderTpSl({
  orderId: 107,
  tpSize: "0",
  tpPrice: "0",
  slSize: "0",
  slPrice: "0",
  executionFeeToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  useOrderCollateral: true,
});
```

### 撤单

```typescript
await myxClient.order.cancelOrder("107");
await myxClient.order.cancelOrders(["107", "108"]);
```

## 模块：仓位（Positions）

### 查询仓位列表

```typescript
const positionsResult = await myxClient.position.listPositions();
if (positionsResult.code === 0) {
  const positions = positionsResult.data;
}
```

### 调整保证金

```typescript
await myxClient.position.adjustCollateral({
  poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  positionId: "14",
  adjustAmount: "100",
});
```

## 模块：订单数据

```typescript
const ordersResult = await myxClient.order.getOrders();
if (ordersResult.code === 0) {
  const orders = ordersResult.data;
}
```

## 模块：市场（Markets）

```typescript
import { getPools, getOraclePrice, getPoolLevelConfig } from '@myx-trade/sdk';

const pools = (await getPools()).data;
const priceData = await getOraclePrice(421614, [poolId]);
const poolCfg = (await getPoolLevelConfig({ poolId, chainId: 421614 })).data;

const pools2 = await myxClient.markets.listPools();
const level2 = await myxClient.markets.getPoolLevelConfig(poolId);
```

## 模块：工具（授权与费用）

```typescript
const quoteAddress = "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28";
const need = await myxClient.utils.needsApproval(quoteAddress, "1000000000");
if (need) {
  await myxClient.utils.approveAuthorization({ quoteAddress, amount: "1000000000" });
}

const networkFee = await myxClient.utils.getNetworkFee(quoteAddress);
```

## 模块：LP 管理

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

## 模块：订阅（WebSocket）

- `isTestnet` 自动切换连接地址。
- 私有主题（`order`、`position`）需要先 `auth()`，依赖 AccessToken。
- 公共主题：`ticker`、`candle`（kline）。

```typescript
myxClient.subscription.connect();
myxClient.subscription.disconnect();
myxClient.subscription.reconnect();
const connected = myxClient.subscription.isConnected;

const onTickers = (data) => console.log('ticker', data);
myxClient.subscription.subscribeTickers(globalId, onTickers);
myxClient.subscription.unsubscribeTickers(globalId, onTickers);

const onKline = (data) => console.log('kline', data);
myxClient.subscription.subscribeKline(globalId, '1m', onKline);
myxClient.subscription.unsubscribeKline(globalId, '1m', onKline);

await myxClient.subscription.auth();

const onOrder = (data) => console.log('order', data);
await myxClient.subscription.subscribeOrder(onOrder);
myxClient.subscription.unsubscribeOrder(onOrder);

const onPosition = (data) => console.log('position', data);
await myxClient.subscription.subscribePosition(onPosition);
myxClient.subscription.unsubscribePosition(onPosition);

myxClient.subscription.on('open', () => console.log('ws open'));
myxClient.subscription.on('reconnecting', ({ detail }) => console.log('reconnecting', detail));
myxClient.subscription.on('maxreconnectattempts', () => console.log('max attempts'));
myxClient.subscription.off('open', () => {});
```

## 类型参考（Types）

```typescript
// 枚举
export const OrderType = { MARKET: 0, LIMIT: 1, STOP: 2, CONDITIONAL: 3 } as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];
export const TriggerType = { NONE: 0, GTE: 1, LTE: 2 } as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];
export const OperationType = { INCREASE: 0, DECREASE: 1 } as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];
export const Direction = { LONG: 0, SHORT: 1 } as const;
export type Direction = (typeof Direction)[keyof typeof Direction];
export const TimeInForce = { IOC: 0 } as const;
export type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];

// 下单参数
export interface PlaceOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: number;
  orderType: OrderType;
  triggerType: TriggerType;
  direction: Direction;
  collateralAmount: string;
  size: string;
  price: string; // 30 位小数
  timeInForce: TimeInForce;
  postOnly: boolean;
  slippagePct: string; // 万分比
  executionFeeToken: string;
  leverage: number;
  tpSize?: string;
  tpPrice?: string;
  slSize?: string;
  slPrice?: string;
}

// 已有仓位的 TP/SL 参数
export interface PositionTpSlOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: number;
  executionFeeToken: string;
  tpTriggerType: TriggerType;
  slTriggerType: TriggerType;
  direction: Direction;
  tpSize?: string;
  tpPrice?: string;
  slSize?: string;
  slPrice?: string;
}

// 更新订单 TP/SL 参数（对应 order.updateOrderTpSl）
export interface UpdateOrderParams {
  orderId: string;
  tpSize: string;
  tpPrice: string;
  slSize: string;
  slPrice: string;
  useOrderCollateral: boolean;
  executionFeeToken: string;
}

// WebSocket 类型
export type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
export interface TickersDataResponse { type: 'ticker'; globalId: number; data: { C: string; E: number; T: string; h: string; i: string; l: string; p: string; v: string; }; }
export interface KlineDataResponse { type: 'candle'; globalId: number; resolution: KlineResolution; data: { E: number; T: string; c: string; h: string; l: string; o: string; t: number; v: string; }; }
```

## 错误处理

- AccessToken 过期：收到 9401 等错误时，重新执行 `handleAccessToken()`。
- 下单时网络费由 SDK 内部自动查询。

## 依赖

```json
{
  "dependencies": {
    "@myx-trade/sdk": "latest",
    "ethers": "^6.x.x",
    "crypto-js": "^4.x.x",
    "wagmi": "^2.x.x"
  }
}
```

## 注意

- 示例默认使用 Arbitrum Sepolia（421614）。
- 注意单位换算（wei、30 位价格小数等）。
