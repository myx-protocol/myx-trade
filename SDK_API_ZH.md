# MYX Trade SDK 全量 API 参考

> 版本以 `package.json` 中 `version` 为准，运行时通过导出的 `SDK_VERSION` 读取。
>
> **数据来源标记**：`[链上]` 区块链节点 RPC | `[后端]` MYX HTTP 网关 | `[WS]` WebSocket | `[混合]` 两者都有 | `[本地]` 无网络

---

## 目录

1. [初始化与认证](#1-初始化与认证)
2. [订单模块 order](#2-订单模块-order)
3. [持仓模块 position](#3-持仓模块-position)
4. [账户模块 account](#4-账户模块-account)
5. [市场模块 markets](#5-市场模块-markets)
6. [工具模块 utils](#6-工具模块-utils)
7. [无 Gas 模块 seamless](#7-无-gas-模块-seamless)
8. [LP 模块](#8-lp-模块)
9. [实时订阅 subscription](#9-实时订阅-subscription)
10. [争议模块 appeal](#10-争议模块-appeal)
11. [返佣模块 referrals](#11-返佣模块-referrals)
12. [附录](#12-附录)

---

## 1. 初始化与认证

SDK 的初始化与鉴权入口。提供网络配置、钱包 signer 挂载，以及后端接口所需的 AccessToken 生成与刷新方法。

### 安装

```bash
pnpm add @myx-trade/sdk
```

### MyxClientConfig

SDK 实例化入口配置类型。指定当前连接所用网关，设置绑定的 Broker、并装载安全生成 AccessToken 所对应的身份签名委托函数。

```typescript
interface MyxClientConfig {
  chainId: number;              // 链 ID（测试网 421614）
  brokerAddress: string;        // Broker 合约地址，联系 MYX 团队获取
  signer?: ISigner;             // ethers v5/v6 Signer，与 walletClient 二选一
  walletClient?: WalletClient;  // viem WalletClient，推荐（包体更小）
  isTestnet?: boolean;          // 测试网（默认 false）
  isBetaMode?: boolean;         // Beta 环境（默认 false）
  seamlessMode?: boolean;       // 无 Gas 模式（默认 false）
  poolingInterval?: number;     // 内部轮询间隔（ms）
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none'; // 默认 'info'
  socketConfig?: {
    reconnectInterval?: number;    // WS 重连间隔（ms，默认 5000）
    maxReconnectAttempts?: number; // 最大重连次数（默认 5）
  };
  getAccessToken?: () => Promise<{
    code: number;
    msg: string | null;
    data: {
      accessToken: string;
      expireAt: number;      // 秒级时间戳
      allowAccount?: string;
      appId?: string;
    };
  }>;
}
```

### 创建实例

```typescript
import { MyxClient } from '@myx-trade/sdk';

const myxClient = new MyxClient({
  chainId: 421614,
  walletClient,           // 来自 wagmi useWalletClient()
  brokerAddress: BROKER_ADDRESS,
  isTestnet: true,
});
```

### ISigner / SignerLike

```typescript
// SDK 签名器接口
interface ISigner {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
  signTypedData?(...): Promise<string>; // EIP-712，可选
}

type SignerLike = ISigner | ethers.Signer;
```

### myxClient.auth `[本地/后端]`

绑定钱包签名器与 AccessToken 回调，调用后 SDK 才可发起需要签名或鉴权的请求。

> 创建实例后必须调用，完成钱包与 token 绑定。

**入参：**


| 参数名            | 类型                                       | 说明                             |
| -------------- | ---------------------------------------- | ------------------------------ |
| signer         | `SignerLike`（可选）                         | ethers v5/v6 Signer            |
| walletClient   | `WalletClient`（可选）                       | viem WalletClient，与 signer 二选一 |
| getAccessToken | `() => Promise<AccessTokenResponse>`（可选） | AccessToken 获取回调               |


**getAccessToken 签名示例（接入方自行实现）：**

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

### myxClient.updateClientChainId `[本地]`

切换 SDK 当前使用的链和 Broker 地址，多链场景下切换网络时调用。

**入参：**


| 参数名           | 类型       | 说明                 |
| ------------- | -------- | ------------------ |
| chainId       | `number` | 目标链 ID             |
| brokerAddress | `string` | 目标链对应的 Broker 合约地址 |


### myxClient.getAccessToken `[本地]`

读取内存中缓存的 AccessToken，不触发刷新逻辑。

**返回值：**


| 字段  | 类型                       | 说明                     |
| --- | ------------------------ | ---------------------- |
| —   | `Promise<string | null>` | 缓存中的 token，不存在时返回 null |


### myxClient.refreshAccessToken `[后端]`

主动刷新 AccessToken，token 过期（9401）时调用。

**入参：**


| 参数名          | 类型            | 说明          |
| ------------ | ------------- | ----------- |
| forceRefresh | `boolean`（可选） | 是否强制刷新，忽略缓存 |


**返回值：**


| 字段  | 类型                       | 说明         |
| --- | ------------------------ | ---------- |
| —   | `Promise<string | null>` | 刷新后的 token |


### myxClient.close `[WS]`

关闭 SDK，断开 WebSocket 连接并清理内部状态。

---

## 2. 订单模块 order

与 **TradingRouter** 交互的订单功能封装。提供开仓、平仓、加减仓及各类条件单（限价/止盈止损）的发送方法，以及对当前活跃挂单和历史记录的查询接口。

### 枚举

```typescript
// 订单类型
const OrderType = {
  MARKET: 0,      // 市价单
  LIMIT: 1,       // 限价单
  STOP: 2,        // 止损单
  CONDITIONAL: 3, // 条件单
} as const;
type OrderType = (typeof OrderType)[keyof typeof OrderType];

// 触发方向
const TriggerType = {
  NONE: 0, // 无触发
  GTE: 1,  // >= 触发（止盈）
  LTE: 2,  // <= 触发（止损）
} as const;
type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

// 操作类型
const OperationType = {
  INCREASE: 0, // 开仓 / 加仓
  DECREASE: 1, // 平仓 / 减仓
} as const;
type OperationType = (typeof OperationType)[keyof typeof OperationType];

// 方向
const Direction = {
  LONG: 0,
  SHORT: 1,
} as const;
type Direction = (typeof Direction)[keyof typeof Direction];

// 成交时效
const TimeInForce = {
  IOC: 0, // Immediate Or Cancel
} as const;
type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];
```

### PlaceOrderParams

打包建立发单或挂单时所需业务要求的参数体。包含了底层认源的买卖标杆方向、杠杆乘数配比、滑点区间值以及跟随附送的离场限价委托（TP/SL）。

```typescript
interface PlaceOrderParams {
  chainId: number;
  address: `0x${string}`;     // 用户 EOA 地址
  poolId: string;              // 池子地址
  positionId: string;          // 新仓位传 ''，加仓/平仓传已有仓位 ID
  orderType: OrderType;
  triggerType: TriggerType;
  direction: Direction;
  collateralAmount: string;    // 保证金（报价代币精度，如 USDC 6 位）
  size: string;                // 仓位大小（18 位精度）
  price: string;               // 价格（30 位精度）
  timeInForce: TimeInForce;
  postOnly: boolean;           // 是否只做 maker
  slippagePct: string;         // 滑点，单位 bps（100 = 1%）
  executionFeeToken: string;   // 执行费代币地址（通常为 USDC）
  leverage: number;
  tpSize?: string;             // 止盈数量（18 位精度）
  tpPrice?: string;            // 止盈价格（30 位精度）
  slSize?: string;             // 止损数量（18 位精度）
  slPrice?: string;            // 止损价格（30 位精度）
}
```

### PositionTpSlOrderParams

只针对已有静态持仓重新覆盖增订退出策略的止盈/止损（TP/SL）参数。发送该载荷将不再重新申请容量。

```typescript
interface PositionTpSlOrderParams {
  chainId: number;
  address: `0x${string}`;
  poolId: string;
  positionId: string;          // 已有仓位 ID
  executionFeeToken: string;
  tpTriggerType: TriggerType;  // GTE
  slTriggerType: TriggerType;  // LTE
  direction: Direction;
  leverage: number;
  slippagePct?: string;        // bps
  tpSize?: string;
  tpPrice?: string;            // 30 位精度
  slSize?: string;
  slPrice?: string;            // 30 位精度
}
```

### UpdateOrderParams

下发或调整尚未最终击穿撮合引擎的价格改动请求。支持变更未触发前的金额以及数量容量限制。

```typescript
interface UpdateOrderParams {
  orderId: string;
  size: string;
  price: string;               // 30 位精度
  tpSize: string;
  tpPrice: string;             // 30 位精度
  slSize: string;
  slPrice: string;             // 30 位精度
  useOrderCollateral: boolean;
  executionFeeToken: string;
}
```

### GetHistoryOrdersParams

限定获取下传明细分页查询的参数体。规定了要检索的池范围及相关历史操作报表页码。

```typescript
interface GetHistoryOrdersParams {
  chainId: number;
  poolId?: string;  // 按池过滤（可选）
  page?: number;
  limit: number;
}
```

---

### 保证金 / networkFee / Deposit 业务口径

#### 公式

**开仓（无持仓，positionId 为空）：**

```
保证金总量 = collateral
           + networkFee(开仓)
           + networkFee(TP，若有)
           + networkFee(SL，若有)
           + networkFee(预留爆仓)   ← 加仓时无此项
           + tradingFee
```

**加仓（已有持仓，positionId 非空）：**

```
保证金总量 = collateral + networkFee(开仓) + networkFee(TP) + networkFee(SL) + tradingFee
```

**部分平仓：**

```
保证金总量 = networkFee(平仓) + Δ（剩余保证金不足以覆盖执行费时的补足缺口）
```

**全部平仓：** `保证金总量 = 0`，`closeAllPositions` 内部 deposit 固定为 `'0'`

**Deposit（从钱包补入）：** `max(0, 保证金总量 - 当前可用保证金)`

#### 计算流程代码

```typescript
// ─── 1. 获取单笔执行费基数 ───────────────────────────────────────
const singleNetworkFee = await myxClient.utils.getNetworkFee(marketId, chainId);
// 返回 string（wei），例如 "500000"

// ─── 2. 按场景累加 networkFee ────────────────────────────────────
// 无持仓开仓（含预留爆仓执行费）
const networkFeeTotal = (
  BigInt(singleNetworkFee)        // 开仓执行费
  + (hasTp ? BigInt(singleNetworkFee) : 0n)  // TP 执行费（若设了止盈）
  + (hasSl ? BigInt(singleNetworkFee) : 0n)  // SL 执行费（若设了止损）
  + BigInt(singleNetworkFee)      // 预留爆仓执行费（仅无仓位时）
).toString();
// 加仓时去掉最后一项「预留爆仓执行费」

// ─── 3. 计算 tradingFee ──────────────────────────────────────────
const feeRate = await myxClient.utils.getUserTradingFeeRate(assetClass, riskTier, chainId);
// feeRate.data: { takerFeeRate, makerFeeRate, baseTakerFeeRate, baseMakerFeeRate }
// takerFeeRate 单位：1e6（即 1000 = 0.1%）

// tradingFee = size × price × takerFeeRate / 1e18 / 1e30 / 1e6
// 其中 size 精度 18 位，price 精度 30 位，takerFeeRate 精度 1e6
const tradingFee =
  (BigInt(size) * BigInt(price) * BigInt(feeRate.data.takerFeeRate))
  / BigInt(1e18)   // 抵消 size 精度
  / BigInt(1e30)   // 抵消 price 精度
  / BigInt(1e6);   // 抵消 feeRate 精度
// 结果单位与 collateralAmount 相同（报价代币精度）

// ─── 4. 计算保证金总量 ───────────────────────────────────────────
const totalMarginRequired =
  BigInt(collateralAmount) + BigInt(networkFeeTotal) + tradingFee;

// ─── 5. 获取可用保证金 ───────────────────────────────────────────
const marginResult = await myxClient.account.getAvailableMarginBalance({
  poolId,
  chainId,
  address: userAddress,
});
const availableMargin = marginResult.data; // bigint

// ─── 6. 计算需补入的 Deposit ─────────────────────────────────────
const depositAmount =
  totalMarginRequired > availableMargin
    ? (totalMarginRequired - availableMargin).toString()
    : '0';

// ─── 7. 下单 ────────────────────────────────────────────────────
// networkFee 参数传执行费合计（不含 tradingFee）
const result = await myxClient.order.createIncreaseOrder(
  {
    chainId,
    address: userAddress,
    poolId,
    positionId: '',       // 新仓位
    orderType: OrderType.MARKET,
    triggerType: TriggerType.NONE,
    direction: Direction.LONG,
    collateralAmount,     // string，USDC 精度
    size,                 // string，18 位精度
    price,                // string，30 位精度
    timeInForce: TimeInForce.IOC,
    postOnly: false,
    slippagePct: '100',   // 1%
    executionFeeToken: quoteTokenAddress,
    leverage: 10,
  },
  networkFeeTotal,        // string：仅执行费合计，不含 tradingFee
);
```

> **注意**：`tradingFee` 不传入 `createIncreaseOrder` 的第二个参数，SDK 内部用 `needAmount = BigInt(collateralAmount) + BigInt(networkFee)` 与 `getAvailableMarginBalance` 比较，`tradingFee` 由合约侧在执行时直接扣除。上面第 6 步计算 deposit 时若希望 UI 展示更精确，可将 `tradingFee` 也纳入 `totalMarginRequired`。

---

### order.createIncreaseOrder `[链上]`

创建开仓或加仓订单，支持市价/限价/条件单，可附带止盈止损。

> 前置检查：链上 allowance / 余额 / 可用保证金

**入参：**


| 参数名        | 类型                 | 说明                             |
| ---------- | ------------------ | ------------------------------ |
| params     | `PlaceOrderParams` | 开/加仓订单参数，见 PlaceOrderParams 定义 |
| networkFee | `string`           | 汇总后的执行费字符串（wei），不含 tradingFee  |


**返回值：**


| 字段                   | 类型                   | 说明         |
| -------------------- | -------------------- | ---------- |
| code                 | `number`             | 状态码，0 为成功  |
| data.transactionHash | `string`             | 交易哈希       |
| data.receipt         | `TransactionReceipt` | 链上交易回执     |
| data.orderId         | `string`（可选）         | 链上生成的订单 ID |
| message              | `string`（可选）         | 错误信息       |


### order.createDecreaseOrder `[链上]`

创建平仓或减仓订单，collateralAmount 决定是否从钱包追加保证金。

**入参：**


| 参数名    | 类型                 | 说明                             |
| ------ | ------------------ | ------------------------------ |
| params | `PlaceOrderParams` | 平/减仓订单参数，见 PlaceOrderParams 定义 |


**返回值：**


| 字段                   | 类型                   | 说明         |
| -------------------- | -------------------- | ---------- |
| code                 | `number`             | 状态码，0 为成功  |
| data.transactionHash | `string`             | 交易哈希       |
| data.receipt         | `TransactionReceipt` | 链上交易回执     |
| data.orderId         | `string`（可选）         | 链上生成的订单 ID |
| message              | `string`（可选）         | 错误信息       |


### order.closeAllPositions `[链上]`

批量一次性平掉传入的所有仓位，内部 deposit 固定为 0。

**入参：**


| 参数名         | 类型                   | 说明         |
| ----------- | -------------------- | ---------- |
| chainId     | `number`             | 链 ID       |
| paramsArray | `PlaceOrderParams[]` | 各仓位的平仓参数数组 |


**返回值：**


| 字段  | 类型                                 | 说明          |
| --- | ---------------------------------- | ----------- |
| —   | `Array<{ code, data?, message? }>` | 每个仓位的平仓结果数组 |


### order.createPositionTpSlOrder `[链上]`

为已有持仓追加止盈止损订单，无需重新开仓。

**入参：**


| 参数名    | 类型                        | 说明                                    |
| ------ | ------------------------- | ------------------------------------- |
| params | `PositionTpSlOrderParams` | 止盈止损订单参数，见 PositionTpSlOrderParams 定义 |


**返回值：**


| 字段                   | 类型                   | 说明         |
| -------------------- | -------------------- | ---------- |
| code                 | `number`             | 状态码，0 为成功  |
| data.transactionHash | `string`             | 交易哈希       |
| data.receipt         | `TransactionReceipt` | 链上交易回执     |
| data.orderId         | `string`（可选）         | 链上生成的订单 ID |
| message              | `string`（可选）         | 错误信息       |


### order.updateOrderTpSl `[链上]`

修改已有挂单的止盈止损价格和数量。

**入参：**


| 参数名          | 类型                  | 说明                          |
| ------------ | ------------------- | --------------------------- |
| params       | `UpdateOrderParams` | 更新参数，见 UpdateOrderParams 定义 |
| quoteAddress | `string`            | 报价代币地址                      |
| chainId      | `number`            | 链 ID                        |
| address      | ``0x${string}``     | 用户地址                        |
| marketId     | `string`            | 市场 ID                       |
| isTpSlOrder  | `boolean`（可选）       | 是否为 TpSl 订单                 |


**返回值：**


| 字段                   | 类型                   | 说明         |
| -------------------- | -------------------- | ---------- |
| code                 | `number`             | 状态码，0 为成功  |
| data.transactionHash | `string`             | 交易哈希       |
| data.receipt         | `TransactionReceipt` | 链上交易回执     |
| data.orderId         | `string`（可选）         | 链上生成的订单 ID |
| message              | `string`（可选）         | 错误信息       |


### order.cancelOrder `[链上]`

取消单个未成交挂单。

**入参：**


| 参数名     | 类型       | 说明        |
| ------- | -------- | --------- |
| orderId | `string` | 要取消的订单 ID |
| chainId | `number` | 链 ID      |


### order.cancelOrders `[链上]`

批量取消多个未成交挂单。

**入参：**


| 参数名      | 类型         | 说明           |
| -------- | ---------- | ------------ |
| orderIds | `string[]` | 要取消的订单 ID 数组 |
| chainId  | `number`   | 链 ID         |


### order.cancelAllOrders `[链上]`

取消传入 ID 列表对应的所有未成交挂单。

**入参：**


| 参数名      | 类型         | 说明           |
| -------- | ---------- | ------------ |
| orderIds | `string[]` | 要取消的订单 ID 数组 |
| chainId  | `number`   | 链 ID         |


### order.getOrders `[后端]`

查询当前账户的所有未成交挂单列表。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段   | 类型        | 说明        |
| ---- | --------- | --------- |
| code | `number`  | 状态码，0 为成功 |
| data | `Order[]` | 未成交挂单列表   |


### order.getOrderHistory `[后端]`

查询账户历史已成交或已取消的订单记录，支持按池过滤。

**入参：**


| 参数名     | 类型                       | 说明                                  |
| ------- | ------------------------ | ----------------------------------- |
| params  | `GetHistoryOrdersParams` | 分页与过滤参数，见 GetHistoryOrdersParams 定义 |
| address | ``0x${string}``          | 用户钱包地址                              |


**返回值：**


| 字段   | 类型        | 说明        |
| ---- | --------- | --------- |
| code | `number`  | 状态码，0 为成功 |
| data | `Order[]` | 历史订单列表    |


---

## 3. 持仓模块 position

主要管理并渲染用户的持仓数据视图。此外还支持绕开重开仓流程，直接操作增加或抽离该指定持仓所托管的保证金池。

### OracleType

标线基础喂价预言机来源类型。以提供正确对应的合约预言机查询通道口（如选取 Chainlink/Pyth 等）。

```typescript
enum OracleType {
  Chainlink = 1,
  Pyth = 2,
}
```

### position.listPositions `[后端]`

查询当前账户所有未平仓持仓，可传 positionId 查询单个。

**入参：**


| 参数名        | 类型              | 说明        |
| ---------- | --------------- | --------- |
| address    | ``0x${string}`` | 用户钱包地址    |
| positionId | `string`（可选）    | 指定时仅返回该持仓 |


**返回值：**


| 字段   | 类型           | 说明        |
| ---- | ------------ | --------- |
| code | `number`     | 状态码，0 为成功 |
| data | `Position[]` | 持仓列表      |


### position.getPositionHistory `[后端]`

查询历史已平仓记录，支持按池和分页过滤。

**入参：**


| 参数名     | 类型                       | 说明                                  |
| ------- | ------------------------ | ----------------------------------- |
| params  | `GetHistoryOrdersParams` | 分页与过滤参数，见 GetHistoryOrdersParams 定义 |
| address | ``0x${string}``          | 用户钱包地址                              |


**返回值：**


| 字段   | 类型           | 说明        |
| ---- | ------------ | --------- |
| code | `number`     | 状态码，0 为成功 |
| data | `Position[]` | 历史持仓列表    |


### position.adjustCollateral `[混合]`

对指定持仓增加或减少保证金，正数增加负数减少。

> 预言机价格 `[后端]`；保证金可用额 `[链上]` + 争议状态 `[后端]`；交易 `[链上]`

**入参：**


| 参数名            | 类型              | 说明                     |
| -------------- | --------------- | ---------------------- |
| poolId         | `string`        | 池子地址                   |
| positionId     | `string`        | 持仓 ID                  |
| adjustAmount   | `string`        | 调整数量，正数增加、负数减少（报价代币精度） |
| quoteToken     | `string`        | 报价代币地址                 |
| poolOracleType | `OracleType`    | 该池使用的预言机类型             |
| chainId        | `number`        | 链 ID                   |
| address        | ``0x${string}`` | 用户钱包地址                 |


**返回值：**


| 字段        | 类型           | 说明        |
| --------- | ------------ | --------- |
| code      | `number`     | 状态码，0 为成功 |
| data.hash | `string`（可选） | 交易哈希      |
| message   | `string`（可选） | 错误信息      |


---

## 4. 账户模块 account

统一维度的总账单管理封装。用户正式执行合约交易前，须过该网关将底仓存入到隔离系统账户（Isolated QUOTE-margined）。同时也提供费率台阶（VIP）的展示逻辑。

### AccountInfo

汇总归类在当前池对应的所有账户资产明细。可拉取包括 Free Margin（可信使用资产）与目前总体产生 Unrealized PnL 等的综合表现数据。

```typescript
interface AccountInfo {
  freeMargin: string;    // 可用保证金
  quoteProfit: string;   // 未实现盈亏
  // ...其他链上字段
}
```



### account.getAvailableMarginBalance `[混合]`

查询账户在指定池中可用于下单的保证金余额，下单前必须调用以计算 deposit。

> `getAccountInfo [链上]` + `appeal.getAppealStatus [后端]`

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| poolId  | `string`        | 池子地址   |
| chainId | `number`        | 链 ID   |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段   | 类型       | 说明         |
| ---- | -------- | ---------- |
| code | `number` | 状态码，0 为成功  |
| data | `bigint` | 可用保证金（wei） |


### account.deposit `[链上]`

将钱包中的报价代币存入交易账户保证金，可能自动先执行 approve。

> 可能先执行链上 approve

**入参：**


| 参数名          | 类型       | 说明           |
| ------------ | -------- | ------------ |
| amount       | `string` | 存入数量（报价代币精度） |
| tokenAddress | `string` | 报价代币合约地址     |
| chainId      | `number` | 链 ID         |


**返回值：**


| 字段   | 类型                   | 说明        |
| ---- | -------------------- | --------- |
| code | `number`             | 状态码，0 为成功 |
| data | `TransactionReceipt` | 链上交易回执    |


### account.updateAndWithdraw `[链上]`

从交易账户保证金提取资金到指定钱包地址,需要根据利润解锁时间及池子的申诉状态提取。

**入参：**


| 参数名          | 类型        | 说明                         |
| ------------ | --------- | -------------------------- |
| receiver     | `string`  | 接收地址                       |
| poolId       | `string`  | 池子地址                       |
| isQuoteToken | `boolean` | `true` 提报价代币，`false` 提基础代币 |
| amount       | `string`  | 提取数量（代币精度）                 |
| chainId      | `number`  | 链 ID                       |


**返回值：**


| 字段   | 类型                   | 说明        |
| ---- | -------------------- | --------- |
| code | `number`             | 状态码，0 为成功 |
| data | `TransactionReceipt` | 链上交易回执    |


### account.getAccountInfo `[链上]`

获取账户在指定池的详细信息，含可用保证金、未实现盈亏等。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| address | ``0x${string}`` | 用户钱包地址 |
| poolId  | `string`        | 池子地址   |


**返回值：**


| 字段   | 类型            | 说明        |
| ---- | ------------- | --------- |
| code | `number`      | 状态码，0 为成功 |
| data | `AccountInfo` | 账户详情对象    |


### account.getAccountVipInfo `[链上]`

从链上读取账户的 VIP 等级、推荐人及费率配置。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段                     | 类型       | 说明              |
| ---------------------- | -------- | --------------- |
| tier                   | `number` | VIP 费率等级        |
| referrer               | `string` | 推荐人地址           |
| totalReferralRebatePct | `number` | 总返佣比例（精度 1e8）   |
| referrerRebatePct      | `number` | 推荐人返佣比例（精度 1e8） |
| nonce                  | `number` | 当前链上 nonce      |
| deadline               | `number` | 签名过期时间戳         |


### account.getCurrentFeeDataEpoch `[链上]`

获取当前费率数据的 epoch 轮次，VIP 费率设置流程中使用。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |


**返回值：**


| 字段  | 类型       | 说明            |
| --- | -------- | ------------- |
| —   | `bigint` | 当前费率 epoch 轮次 |


### account.setUserFeeData `[链上]`

使用后端 EIP-712 签名在链上为当前账户绑定 VIP 费率等级和推荐人返佣配置；链上合约验证 epoch、nonce 严格匹配且未过期，确保防重放安全。

> 底层合约：`Broker.setUserFeeData`  
> 链上验证顺序：① epoch 匹配当前纪元 → ② 签名者在授权集合中 → ③ deadline 未过期 → ④ nonce == userNonce + 1

**入参：**


| 参数名                            | 类型              | 说明                                |
| ------------------------------ | --------------- | --------------------------------- |
| address                        | ``0x${string}`` | 用户钱包地址                            |
| chainId                        | `number`        | 链 ID                              |
| deadline                       | `number`        | 签名过期 Unix 时间戳                     |
| feeData.tier                   | `number`        | VIP 费率等级（0 = 默认）                  |
| feeData.referrer               | `string`        | 推荐人地址（无推荐传零地址）                    |
| feeData.totalReferralRebatePct | `number`        | 总返佣比例（精度 1e8，100_000_000 = 100%）  |
| feeData.referrerRebatePct      | `number`        | 推荐人返佣比例（≤ totalReferralRebatePct） |
| feeData.nonce                  | `number`        | 必须等于链上 userNonce + 1              |
| signature                      | `string`        | 后端授权签名者的 EIP-712 签名               |


**返回值：**


| 字段   | 类型                   | 说明        |
| ---- | -------------------- | --------- |
| code | `number`             | 状态码，0 为成功 |
| data | `TransactionReceipt` | 链上交易回执    |


### account.getTradeFlow `[后端]`

获取账户的交易流水历史，含存取款、手续费扣除等记录。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| limit   | `number`        | 每页条数   |
| poolId  | `string`（可选）    | 按池过滤   |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段   | 类型            | 说明        |
| ---- | ------------- | --------- |
| code | `number`      | 状态码，0 为成功 |
| data | `TradeFlow[]` | 交易流水列表    |


---

## 5. 市场模块 markets

提供静态常量和市场行情的查询下发。包含各交易对标的的资金费率、点差状态、配置底线与深度，用于辅助渲染发单面板。

### KlineResolution

用于在获取快照与 Websocket 收发流对齐时所需指定的最细化图表呈现级别（如 5s、1m 或 1h）。

```typescript
type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
```

### markets.getPoolLevelConfig `[后端]`

获取池子的档位配置，如各杠杆档位对应的保证金要求。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| poolId  | `string` | 池子地址 |
| chainId | `number` | 链 ID |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `object` | 池子档位配置对象 |


### markets.getKlineList `[后端]`

获取指定时间粒度的历史 K 线数据列表。

**入参：**


| 参数名      | 类型                | 说明           |
| -------- | ----------------- | ------------ |
| poolId   | `string`          | 池子地址         |
| chainId  | `number`          | 链 ID         |
| interval | `KlineResolution` | K 线时间粒度      |
| limit    | `number`          | 返回条数上限       |
| endTime  | `number`（可选）      | 结束时间（ms 时间戳） |


**返回值：**


| 字段  | 类型           | 说明      |
| --- | ------------ | ------- |
| —   | `KlineBar[]` | K 线数据数组 |


### markets.getKlineLatestBar `[后端]`

获取最新一根 K 线，用于图表实时刷新。

**入参：**


| 参数名      | 类型                | 说明      |
| -------- | ----------------- | ------- |
| poolId   | `string`          | 池子地址    |
| chainId  | `number`          | 链 ID    |
| interval | `KlineResolution` | K 线时间粒度 |


**返回值：**


| 字段  | 类型         | 说明       |
| --- | ---------- | -------- |
| —   | `KlineBar` | 最新一根 K 线 |


### markets.getTickerList `[后端]`

批量获取多个池的实时行情快照（最新价、涨跌幅、成交量等）。

**入参：**


| 参数名     | 类型         | 说明         |
| ------- | ---------- | ---------- |
| chainId | `number`   | 链 ID       |
| poolIds | `string[]` | 要查询的池子地址数组 |


**返回值：**


| 字段  | 类型         | 说明     |
| --- | ---------- | ------ |
| —   | `Ticker[]` | 行情快照数组 |


### markets.searchMarket `[后端]`

按关键词搜索市场，无需认证，不含收藏状态。

**入参：**


| 参数名     | 类型           | 说明     |
| ------- | ------------ | ------ |
| chainId | `number`     | 链 ID   |
| keyword | `string`     | 搜索关键词  |
| limit   | `number`（可选） | 返回条数上限 |


**返回值：**


| 字段  | 类型         | 说明   |
| --- | ---------- | ---- |
| —   | `Market[]` | 市场列表 |


### markets.searchMarketAuth `[后端]`

按关键词搜索市场，需要认证，返回结果含当前用户的收藏状态。

> 需要 token，返回结果含收藏状态

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| keyword | `string`        | 搜索关键词  |
| limit   | `number`（可选）    | 返回条数上限 |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段  | 类型         | 说明                      |
| --- | ---------- | ----------------------- |
| —   | `Market[]` | 市场列表（含 `isFavorite` 字段） |


### markets.getFavoritesList `[后端]`

获取当前用户的收藏市场列表。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| page    | `number`（可选）    | 页码     |
| limit   | `number`        | 每页条数   |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段  | 类型         | 说明     |
| --- | ---------- | ------ |
| —   | `Market[]` | 收藏市场列表 |


### markets.addFavorite / removeFavorite `[后端]`

将指定池添加到或从用户收藏中移除。

**入参：**


| 参数名     | 类型              | 说明     |
| ------- | --------------- | ------ |
| chainId | `number`        | 链 ID   |
| poolId  | `string`        | 池子地址   |
| address | ``0x${string}`` | 用户钱包地址 |


**返回值：**


| 字段             | 类型       | 说明        |
| -------------- | -------- | --------- |
| code           | `number` | 状态码，0 为成功 |
| data / message | `any`    | 成功数据或错误信息 |


### markets.getBaseDetail `[后端]`

获取基础代币的详细信息，如名称、合约地址、精度等。

**入参：**


| 参数名         | 类型       | 说明       |
| ----------- | -------- | -------- |
| chainId     | `number` | 链 ID     |
| baseAddress | `string` | 基础代币合约地址 |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `object` | 基础代币详情对象 |


### markets.getMarketDetail `[后端]`

获取市场的完整详情，含价格、费率、流动性等。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `object` | 市场详细信息对象 |


### markets.getPoolSymbolAll `[后端]`

获取全部池子 ID 与交易对符号的映射表，用于全局列表展示。

**返回值：**


| 字段  | 类型       | 说明                        |
| --- | -------- | ------------------------- |
| —   | `object` | 全池符号表（poolId → symbol 映射） |


### markets.getPoolFundingFeeInfo `[链上]`

从链上读取池子的资金费率相关信息。

**入参：**


| 参数名         | 类型       | 说明             |
| ----------- | -------- | -------------- |
| poolId      | `string` | 池子地址           |
| chainId     | `number` | 链 ID           |
| marketPrice | `string` | 当前市场价格（30 位精度） |


**返回值：**


| 字段             | 类型       | 说明                       |
| -------------- | -------- | ------------------------ |
| code           | `number` | 状态码，0 为成功                |
| data / message | `any`    | 合约 getPoolInfo 结构（含资金费率） |


---

## 6. 工具模块 utils

SDK 内部普遍引用的无态通用工具类。涵盖代币额验证、以当前 **Broker** 配置反推应收的手续费率（Trading Fee）、对交易挂载需要的网费（Network Fee）估计计算等等。

### utils.needsApproval `[链上]`

检查用户是否需要对指定代币进行 ERC20 授权，下单前的必要前置检查。

**入参：**


| 参数名          | 类型                | 说明      |
| ------------ | ----------------- | ------- |
| address      | ``0x${string}``   | 用户钱包地址  |
| chainId      | `number`          | 链 ID    |
| tokenAddress | `string`          | 代币合约地址  |
| amount       | `string | bigint` | 需要授权的数量 |


**返回值：**


| 字段  | 类型        | 说明                                    |
| --- | --------- | ------------------------------------- |
| —   | `boolean` | `true` 表示需要 approve，`false` 表示已授权足够额度 |


### utils.approveAuthorization `[链上]`

发起 ERC20 授权交易，允许 SDK 合约代用户花费代币。

**入参：**


| 参数名          | 类型       | 说明                                      |
| ------------ | -------- | --------------------------------------- |
| chainId      | `number` | 链 ID                                    |
| quoteAddress | `string` | 报价代币合约地址                                |
| amount       | `string` | 授权额度，通常传 `ethers.MaxUint256.toString()` |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


### utils.getUserTradingFeeRate `[链上]`

获取当前用户的 taker/maker 费率，用于计算 tradingFee。

> `Broker.getUserFeeRate`

**入参：**


| 参数名        | 类型       | 说明   |
| ---------- | -------- | ---- |
| assetClass | `number` | 资产类别 |
| riskTier   | `number` | 风险等级 |
| chainId    | `number` | 链 ID |


**返回值：**


| 字段               | 类型       | 说明               |
| ---------------- | -------- | ---------------- |
| takerFeeRate     | `bigint` | 吃单费率（精度 1e6）     |
| makerFeeRate     | `bigint` | 挂单费率（精度 1e6，可为负） |
| baseTakerFeeRate | `bigint` | 基础吃单费率           |
| baseMakerFeeRate | `bigint` | 基础挂单费率           |


### utils.getNetworkFee `[链上]`

获取单笔订单的链上执行费基数，累加后作为 createIncreaseOrder 的 networkFee 参数。

> `MarketManager.getExecutionFee`，返回单笔执行费

**入参：**


| 参数名      | 类型       | 说明    |
| -------- | -------- | ----- |
| marketId | `string` | 市场 ID |
| chainId  | `number` | 链 ID  |


**返回值：**


| 字段  | 类型       | 说明             |
| --- | -------- | -------------- |
| —   | `string` | 单笔执行费（wei 字符串） |


### utils.getOraclePrice `[后端]`

从后端获取指定池的预言机报价和 VAA 载荷，链上提交交易时消费。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| poolId  | `string` | 池子地址 |
| chainId | `number` | 链 ID |


**返回值：**


| 字段          | 类型       | 说明                     |
| ----------- | -------- | ---------------------- |
| price       | `string` | 预言机报价                  |
| vaa         | `string` | Pyth VAA 载荷（Base64）    |
| publishTime | `number` | 价格发布时间戳                |
| poolId      | `string` | 对应池子地址                 |
| value       | `string` | 支付给 Pyth 的 ETH 费用（wei） |


### utils.buildUpdatePriceParams `[混合]`

基于预言机价格构建链上 updatePrice 调用所需的完整参数。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| poolId  | `string` | 池子地址 |
| chainId | `number` | 链 ID |


**返回值：**


| 字段  | 类型       | 说明                                                 |
| --- | -------- | -------------------------------------------------- |
| —   | `object` | 链上 updatePrice 方法所需参数对象（含 vaa、price、publishTime 等） |


### utils.getLiquidityInfo `[链上]`

从链上获取池子的流动性详情，含池内资产量、LP 总量等。

**入参：**


| 参数名         | 类型       | 说明           |
| ----------- | -------- | ------------ |
| chainId     | `number` | 链 ID         |
| poolId      | `string` | 池子地址         |
| marketPrice | `string` | 市场价格（30 位精度） |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `object` | 池流动性信息对象 |


### utils.checkSeamlessGas `[链上]`

检查 seamless 账户是否有足够余额支撑无 Gas 交易的转发费用。

**入参：**


| 参数名     | 类型              | 说明            |
| ------- | --------------- | ------------- |
| address | ``0x${string}`` | seamless 账户地址 |
| chainId | `number`        | 链 ID          |


**返回值：**


| 字段  | 类型        | 说明            |
| --- | --------- | ------------- |
| —   | `boolean` | `true` 表示余额充足 |


### utils.getGasPriceByRatio `[链上]`

按配置比例返回当前 gas 价格，用于动态 gas 策略。

**返回值：**


| 字段  | 类型       | 说明               |
| --- | -------- | ---------------- |
| —   | `bigint` | 调整后的 gas 价格（wei） |


### utils.getGasLimitByRatio `[链上]`

对预估 gas 按配置比例放大，避免交易因 gas 不足失败。

**入参：**


| 参数名          | 类型       | 说明       |
| ------------ | -------- | -------- |
| estimatedGas | `bigint` | 预估 gas 量 |


**返回值：**


| 字段  | 类型       | 说明             |
| --- | -------- | -------------- |
| —   | `bigint` | 放大后的 gas limit |


### utils.getOrderIdFromTransaction `[链上]`

从交易回执中解析 OrderPlaced 事件，提取链上生成的订单 ID。

> 从 receipt logs 解析 `OrderPlaced` 事件

**入参：**


| 参数名     | 类型                   | 说明     |
| ------- | -------------------- | ------ |
| receipt | `TransactionReceipt` | 链上交易回执 |


**返回值：**


| 字段  | 类型                   | 说明                         |
| --- | -------------------- | -------------------------- |
| —   | `string | undefined` | 解析出的订单 ID，未找到时返回 undefined |


### utils.formatErrorMessage `[本地]`

将合约 revert 或 SDK 错误格式化为用户可读的文字描述。

**入参：**


| 参数名   | 类型        | 说明       |
| ----- | --------- | -------- |
| error | `unknown` | 捕获到的错误对象 |


**返回值：**


| 字段  | 类型       | 说明        |
| --- | -------- | --------- |
| —   | `string` | 用户可读的错误信息 |


---

## 7. 无 Gas 模块 seamless

封装在 ERC-2771 标准框架下的零费率代付下单流程。用户侧无需留存 Gas，通过该模块产生的数字签名授权远端执行，极大缩短业务链体验时间。

### seamless.onCheckRelayer `[链上]`

检查 seamless 地址是否已被主账户授权，并确认代币授权状态。

**入参：**


| 参数名               | 类型              | 说明            |
| ----------------- | --------------- | ------------- |
| masterAddress     | ``0x${string}`` | 主账户地址         |
| seamlessAddress   | ``0x${string}`` | seamless 账户地址 |
| chainId           | `number`        | 链 ID          |
| quoteTokenAddress | `string`        | 报价代币合约地址      |


**返回值：**


| 字段            | 类型        | 说明                    |
| ------------- | --------- | --------------------- |
| isRelayer     | `boolean` | seamless 账户是否已被授权为中继器 |
| needsApproval | `boolean` | 是否还需要代币授权             |


### seamless.authorizeSeamlessAccount `[混合]`

授权或撤销 seamless 钱包，完成后即可使用无 Gas 交易流程。

> 主流程入口：授权或撤销 seamless 账户

**入参：**


| 参数名             | 类型        | 说明                   |
| --------------- | --------- | -------------------- |
| approve         | `boolean` | `true` 授权，`false` 撤销 |
| seamlessAddress | `string`  | seamless 账户地址        |
| chainId         | `number`  | 链 ID                 |
| forwardFeeToken | `string`  | 转发费代币地址              |


**返回值：**


| 字段      | 类型                       | 说明        |
| ------- | ------------------------ | --------- |
| code    | `number`                 | 状态码，0 为成功 |
| data    | `TransactionReceipt`（可选） | 链上交易回执    |
| message | `string`（可选）             | 错误信息      |


### seamless.getUSDPermitParams `[链上]`

生成 ERC20 Permit 参数（EIP-2612），用于 forwarder 免 approve 授权。

**入参：**


| 参数名               | 类型       | 说明        |
| ----------------- | -------- | --------- |
| deadline          | `number` | 签名过期秒级时间戳 |
| chainId           | `number` | 链 ID      |
| quoteTokenAddress | `string` | 报价代币合约地址  |


**返回值：**


| 字段  | 类型       | 说明                              |
| --- | -------- | ------------------------------- |
| —   | `object` | Permit 参数对象（含 v、r、s、deadline 等） |


### seamless.getForwardEip712Domain `[链上]`

获取 Forwarder 合约的 EIP-712 签名域，用于构造结构化签名。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |


**返回值：**


| 字段  | 类型       | 说明                                                  |
| --- | -------- | --------------------------------------------------- |
| —   | `object` | EIP-712 域对象（name、version、chainId、verifyingContract） |


### seamless.forwarderTx `[混合]`

提交经 forwarder 合约中继的交易，实现 seamless 账户无 Gas 操作。

**入参：**


| 参数名             | 类型       | 说明                |
| --------------- | -------- | ----------------- |
| from            | `string` | 发起地址（seamless 账户） |
| to              | `string` | 目标合约地址            |
| value           | `string` | 附带的 ETH 数量（wei）   |
| gas             | `string` | gas limit         |
| deadline        | `number` | 请求过期时间戳           |
| data            | `string` | ABI 编码的调用数据       |
| nonce           | `string` | Forwarder nonce   |
| forwardFeeToken | `string` | 转发费代币地址           |
| chainId         | `number` | 链 ID              |


**返回值：**


| 字段      | 类型           | 说明        |
| ------- | ------------ | --------- |
| code    | `number`     | 状态码，0 为成功 |
| data    | `any`（可选）    | 响应数据      |
| message | `string`（可选） | 错误信息      |


### seamless.forwardTxInFront `[混合]`

自动代签并提交 forwarder 交易，内部封装了签名、提交与轮询逻辑。

> 代签 + 提交（内部自动处理签名与轮询）

**入参：**


| 参数名     | 类型       | 说明                                                                         |
| ------- | -------- | -------------------------------------------------------------------------- |
| params  | `object` | 同 forwarderTx 的参数格式（from、to、value、gas、deadline、data、nonce、forwardFeeToken） |
| chainId | `number` | 链 ID                                                                       |


### seamless.getOriginSeamlessAccount `[链上]`

通过 seamless 地址反查其绑定的主账户（master）地址。

**入参：**


| 参数名             | 类型       | 说明            |
| --------------- | -------- | ------------- |
| seamlessAddress | `string` | seamless 账户地址 |
| chainId         | `number` | 链 ID          |


**返回值：**


| 字段            | 类型       | 说明       |
| ------------- | -------- | -------- |
| masterAddress | `string` | 绑定的主账户地址 |


### seamless.formatForwarderTxParams `[链上 + 本地]`

构建 ForwardRequest 结构，自动从链上读取当前 nonce 填入。

**入参：**


| 参数名     | 类型       | 说明                                                                   |
| ------- | -------- | -------------------------------------------------------------------- |
| params  | `object` | ForwardRequest 相关字段（from、to、value、gas、deadline、data、forwardFeeToken） |
| chainId | `number` | 链 ID                                                                 |


**返回值：**


| 字段  | 类型       | 说明                                  |
| --- | -------- | ----------------------------------- |
| —   | `object` | 完整 ForwardRequest 对象（含从链上读取的 nonce） |


---

## 8. LP 模块

独立剥离对向 **LiquidityRouter** 体系的功能管道。聚焦于完成做市资产注入提现、获取对应的生息 mToken（LP 代币），并发起专属该份额的 LP 取消或止盈退出指令。

**导入方式：**

```typescript
import { pool, quote, base, market } from '@myx-trade/sdk';

// 精度常量
import { COMMON_PRICE_DECIMALS, COMMON_LP_AMOUNT_DECIMALS } from '@myx-trade/sdk';
// COMMON_PRICE_DECIMALS = 30
```

### 枚举

```typescript
enum MarketPoolState {
  Cook = 0,     // 市场建立
  Boosted = 1,  // 待 TVL 达标
  Primed = 2,   // 扣费，等待 oracle
  Trench = 3,   // 上架交易
  PreBench = 4, // 预下架
  Bench = 5,    // 下架
}

enum PoolType {
  Base = 0,
  Quote = 1,
}
```

---

### pool 命名空间

#### CreatePoolRequest

```typescript
interface CreatePoolRequest {
  chainId: number;
  baseToken: string;  // 基础代币地址
  marketId: string;
}
```

#### AddTpSLParams

```typescript
interface TpSl {
  amount: number;
  triggerPrice: number;
  triggerType: TriggerType; // TriggerType.GTE（止盈）| TriggerType.LTE（止损）
}

interface AddTpSLParams {
  chainId: number;
  poolId: string;
  poolType: PoolType;
  slippage: number;   // 小数，如 0.01 = 1%
  tpsl: TpSl[];
}
```

#### pool.createPool `[链上]`

创建新的流动性池，绑定基础代币与市场，返回新池的 poolId。

**入参：**


| 参数名       | 类型       | 说明     |
| --------- | -------- | ------ |
| chainId   | `number` | 链 ID   |
| baseToken | `string` | 基础代币地址 |
| marketId  | `string` | 市场 ID  |


**返回值：**


| 字段  | 类型       | 说明        |
| --- | -------- | --------- |
| —   | `string` | 新创建的池子 ID |


#### pool.getPoolDetail `[后端]`

从后端获取池子扫描侧详情，含 TVL、当前状态、费率等。

> 来自扫描侧 HTTP，与 `pool.getPoolInfo`（链上）不同

**入参：**


| 参数名    | 类型       | 说明   |
| ------ | -------- | ---- |
| poolId | `string` | 池子地址 |


**返回值：**


| 字段  | 类型       | 说明                   |
| --- | -------- | -------------------- |
| —   | `object` | 池子详情对象（含 TVL、状态、费率等） |


#### pool.getPoolInfo `[链上]`

从链上读取池子实时信息，含资产量、LP 价格等，与 getPoolDetail 来源不同。

> `DataProvider.read.getPoolInfo`

**入参：**


| 参数名         | 类型           | 说明           |
| ----------- | ------------ | ------------ |
| chainId     | `number`     | 链 ID         |
| poolId      | `string`     | 池子地址         |
| marketPrice | `string`（可选） | 市场价格（30 位精度） |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `object` | 链上池子信息对象 |


#### pool.getMarketPoolId `[链上]`

查询指定基础代币和市场组合对应的池子 ID。

**入参：**


| 参数名       | 类型       | 说明     |
| --------- | -------- | ------ |
| chainId   | `number` | 链 ID   |
| baseToken | `string` | 基础代币地址 |
| marketId  | `string` | 市场 ID  |


**返回值：**


| 字段  | 类型       | 说明       |
| --- | -------- | -------- |
| —   | `string` | 对应的池子 ID |


#### pool.getMarketPools `[链上]`

获取某个市场下所有池子的 ID 列表。

**入参：**


| 参数名      | 类型       | 说明    |
| -------- | -------- | ----- |
| chainId  | `number` | 链 ID  |
| marketId | `string` | 市场 ID |


**返回值：**


| 字段  | 类型         | 说明             |
| --- | ---------- | -------------- |
| —   | `string[]` | 该市场下所有池子 ID 列表 |


#### pool.getUserGenesisShare `[链上]`

获取用户在池子中持有的创世份额（早期 LP 激励相关）。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段    | 类型       | 说明        |
| ----- | -------- | --------- |
| share | `bigint` | 用户持有的创世份额 |


#### pool.addTpSl `[链上]`

为 LP 仓位添加止盈止损订单，价格触达时自动提取流动性。

**入参：**


| 参数名      | 类型         | 说明                 |
| -------- | ---------- | ------------------ |
| chainId  | `number`   | 链 ID               |
| poolId   | `string`   | 池子地址               |
| poolType | `PoolType` | 池子类型（Base 或 Quote） |
| slippage | `number`   | 滑点（小数，如 0.01 = 1%） |
| tpsl     | `TpSl[]`   | 止盈止损参数数组           |


#### pool.cancelTpSl `[链上]`

取消 LP 仓位上已设置的止盈止损订单。

**入参：**


| 参数名     | 类型       | 说明              |
| ------- | -------- | --------------- |
| chainId | `number` | 链 ID            |
| orderId | `string` | 要取消的 TpSl 订单 ID |


#### pool.reprime `[链上]`

重新触发处于 Primed 状态的池子进入准备流程。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


#### pool.getOpenOrders `[后端]`

查询 LP 池当前未成交的 TP/SL 订单列表。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段  | 类型        | 说明              |
| --- | --------- | --------------- |
| —   | `Order[]` | 未成交的 TP/SL 订单列表 |


---

### quote 命名空间

专属用于操作 Quote 池（稳定币计价池，如 USDC / USDT）的方法集合。用户可通过该底层模块存取稳定币计价资产以提供流动性，并在无常损失规避下获取交易手续费及资金费率收益。

#### Deposit（Quote）

Quote 池流动性存入参数。用于向 **LiquidityRouter** 提交稳态资金以获取对应的 mToken（LP 凭证），支持在存入时配置滑点及对应的止盈止损策略。

```typescript
interface QuoteDepositParams {
  chainId: number;
  poolId: string;
  amount: number;      // 人类可读数量（非 wei）
  slippage: number;    // 如 0.01
  tpsl?: Array<{
    triggerPrice: number;
    triggerType: TriggerType;
  }>;
}
```

#### WithdrawParams（Quote）

```typescript
interface QuoteWithdrawParams {
  chainId: number;
  poolId: string;
  amount: number;
  slippage: number;
}
```

#### quote.deposit `[链上]`

向 Quote 池存入报价代币（如 USDC）以提供流动性，可附带止盈止损。

**入参：**


| 参数名      | 类型                                         | 说明               |
| -------- | ------------------------------------------ | ---------------- |
| chainId  | `number`                                   | 链 ID             |
| poolId   | `string`                                   | 池子地址             |
| amount   | `number`                                   | 存入数量（人类可读，非 wei） |
| slippage | `number`                                   | 滑点（如 0.01 = 1%）  |
| tpsl     | `Array<{ triggerPrice, triggerType }>`（可选） | 止盈止损参数           |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### quote.withdraw `[链上]`

从 Quote 池提取已存入的报价代币流动性。

**入参：**


| 参数名      | 类型       | 说明                   |
| -------- | -------- | -------------------- |
| chainId  | `number` | 链 ID                 |
| poolId   | `string` | 池子地址                 |
| amount   | `number` | 提取 LP 数量（人类可读，非 wei） |
| slippage | `number` | 滑点（如 0.01 = 1%）      |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### quote.transfer `[混合]`

将当前账户的 Quote LP 代币转给其他地址。

> 通过后端 `getPoolInfo` 校验后执行链上转账

**入参：**


| 参数名       | 类型                | 说明          |
| --------- | ----------------- | ----------- |
| chainId   | `number`          | 链 ID        |
| poolId    | `string`          | 池子地址        |
| recipient | `string`          | 接收地址        |
| amount    | `number | string` | 转移的 LP 代币数量 |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### quote.getLpPrice `[混合]`

获取 Quote LP 代币的当前单价。

> `getPriceData [后端]` + `QuotePool.getPoolTokenPrice [链上]`

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


**返回值：**


| 字段  | 类型       | 说明      |
| --- | -------- | ------- |
| —   | `string` | LP 代币单价 |


#### quote.getRewards `[混合]`

查询账户在 Quote 池中积累的待领取奖励金额。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段      | 类型       | 说明           |
| ------- | -------- | ------------ |
| rewards | `bigint` | 待领取奖励金额（wei） |


#### quote.claimQuotePoolRebate `[链上]`

从单个 Quote 池领取返佣奖励到钱包。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### quote.claimQuotePoolRebates `[链上]`

从多个 Quote 池批量领取返佣奖励。

**入参：**


| 参数名     | 类型         | 说明           |
| ------- | ---------- | ------------ |
| chainId | `number`   | 链 ID         |
| poolIds | `string[]` | 要领取返佣的池子地址数组 |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### quote.withdrawableLpAmount `[链上]`

查询账户当前可提取的 Quote LP 代币数量上限。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段  | 类型       | 说明             |
| --- | -------- | -------------- |
| —   | `bigint` | 可提取的 LP 代币数量上限 |


---

### base 命名空间

专属用于操作 Base 池（基础资产池，例如 BTC、ETH 等币本位资产）的方法集合。用户可直接使用原生加密资产提供流动性，在保持币本位敞口的同时赚取协议的分润收益。

#### BaseDepositParams

Base 池流动性存入参数。用于向 **LiquidityRouter** 提交基础波动代币以获取关联的 mToken（LP 凭证），同样支持附带滑点保护及退出的止盈止损条件。

```typescript
interface BaseDepositParams {
  chainId: number;
  poolId: string;
  amount: number;      // 人类可读数量
  slippage: number;
  tpsl?: Array<{
    triggerPrice: number;
    triggerType: TriggerType;
  }>;
}
```

#### PreviewWithdrawDataParams

LP 提取预览参数结构体。用于在执行提取操作前，根据计划销毁的 mToken 数量以及系统的实时盈亏（PnL），准确计算并向用户展示实际可取回的资产数量。

```typescript
interface PreviewWithdrawDataParams {
  chainId: number;
  poolId: string;
  account: string;
  amount: string | number;
}
```

#### base.deposit `[链上]`

向 Base 池存入基础代币（如 ETH/BTC）以提供流动性，可附带止盈止损。

**入参：**


| 参数名      | 类型                                         | 说明               |
| -------- | ------------------------------------------ | ---------------- |
| chainId  | `number`                                   | 链 ID             |
| poolId   | `string`                                   | 池子地址             |
| amount   | `number`                                   | 存入数量（人类可读，非 wei） |
| slippage | `number`                                   | 滑点（如 0.01 = 1%）  |
| tpsl     | `Array<{ triggerPrice, triggerType }>`（可选） | 止盈止损参数           |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### base.withdraw `[链上]`

从 Base 池提取已存入的基础代币流动性。

**入参：**


| 参数名      | 类型       | 说明                   |
| -------- | -------- | -------------------- |
| chainId  | `number` | 链 ID                 |
| poolId   | `string` | 池子地址                 |
| amount   | `number` | 提取 LP 数量（人类可读，非 wei） |
| slippage | `number` | 滑点（如 0.01 = 1%）      |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


#### base.previewUserWithdrawData `[混合]`

提取前预览可获得的基础代币数量，用于 UI 展示确认页。

> Oracle `[后端]` + BasePool `previewUserWithdrawData [链上]`

**入参：**


| 参数名     | 类型                | 说明          |
| ------- | ----------------- | ----------- |
| chainId | `number`          | 链 ID        |
| poolId  | `string`          | 池子地址        |
| account | `string`          | 用户地址        |
| amount  | `string | number` | 预览提取的 LP 数量 |


**返回值：**


| 字段         | 类型       | 说明              |
| ---------- | -------- | --------------- |
| baseAmount | `bigint` | 可获得的基础代币数量（wei） |
| lpAmount   | `bigint` | 对应的 LP 代币数量     |


#### base.getLpPrice `[链上]`

获取 Base LP 代币的当前单价，纯链上计算无后端依赖。

> 纯链上，与 `quote.getLpPrice` 区别在于无后端 oracle 依赖

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


**返回值：**


| 字段  | 类型       | 说明           |
| --- | -------- | ------------ |
| —   | `string` | Base LP 代币单价 |


#### base.getRewards `[混合]`

查询账户在 Base 池中积累的待领取奖励金额。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段      | 类型       | 说明           |
| ------- | -------- | ------------ |
| rewards | `bigint` | 待领取奖励金额（wei） |


#### base.claimBasePoolRebate `[链上]`

从单个 Base 池领取返佣奖励到钱包。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


#### base.claimBasePoolRebates `[链上]`

从多个 Base 池批量领取返佣奖励。

**入参：**


| 参数名     | 类型         | 说明           |
| ------- | ---------- | ------------ |
| chainId | `number`   | 链 ID         |
| poolIds | `string[]` | 要领取返佣的池子地址数组 |


#### base.previewLpAmountOut / previewBaseAmountOut `[链上]`

预览存入指定数量基础代币可获得多少 LP 代币，或燃烧指定数量 LP 代币可获得多少基础代币，用于 UI 展示。

```typescript
// 预览存入/取出数量（用于 UI 展示）
const lpOut = await base.previewLpAmountOut(params)
const baseOut = await base.previewBaseAmountOut(params)
// 出参：bigint
```

#### base.withdrawableLpAmount `[链上]`

查询账户当前可提取的 Base LP 代币数量上限。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |
| account | `string` | 用户地址 |


**返回值：**


| 字段  | 类型       | 说明             |
| --- | -------- | -------------- |
| —   | `bigint` | 可提取的 LP 代币数量上限 |


---

### market 命名空间

#### market.getMarket `[链上]`

从链上获取市场的配置信息。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |


**返回值：**


| 字段  | 类型       | 说明     |
| --- | -------- | ------ |
| —   | `object` | 市场信息对象 |


#### market.getOracleFee `[链上]`

获取提交预言机价格更新时需支付的费用，LP 操作前需查询。

**入参：**


| 参数名     | 类型       | 说明   |
| ------- | -------- | ---- |
| chainId | `number` | 链 ID |
| poolId  | `string` | 池子地址 |


**返回值：**


| 字段  | 类型       | 说明         |
| --- | -------- | ---------- |
| —   | `bigint` | 预言机费用（wei） |


---

## 9. 实时订阅 subscription

下发即时异步状态数据。承载如盘口深度（Orderbook）、极速 K线切片等的市场数据更新推送，以及私人相关事件订阅。

### 数据类型

```typescript
type KlineResolution = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

interface TickersDataResponse {
  type: 'ticker';
  globalId: number;
  data: {
    C: string; // 收盘价
    E: number; // 事件时间（ms）
    T: string; // 时间戳
    h: string; // 最高价
    i: string; // 指数价格
    l: string; // 最低价
    p: string; // 价格变化百分比
    v: string; // 成交量
  };
}

interface KlineDataResponse {
  type: 'candle';
  globalId: number;
  resolution: KlineResolution;
  data: {
    E: number; // 事件时间
    T: string; // 时间戳
    c: string; // 收盘价
    h: string; // 最高价
    l: string; // 最低价
    o: string; // 开盘价
    t: number; // 时间
    v: string; // 成交量
  };
}
```

### 连接管理 `[WS]`

```typescript
myxClient.subscription.connect(): void
myxClient.subscription.disconnect(): void
myxClient.subscription.reconnect(): void
myxClient.subscription.isConnected: boolean  // 只读属性
```

### 事件监听 `[本地]`

```typescript
type SocketEvent = 'open' | 'close' | 'error' | 'reconnecting' | 'maxreconnectattempts';

myxClient.subscription.on(event: SocketEvent, handler: Function): void
myxClient.subscription.off(event: SocketEvent, handler: Function): void
```

### subscription.subscribeTickers `[WS]`

订阅一个或多个池的实时行情 Ticker 推送。

**入参：**


| 参数名      | 类型                                    | 说明               |
| -------- | ------------------------------------- | ---------------- |
| globalId | `number | number[]`                   | 单个或多个池的 globalId |
| callback | `(data: TickersDataResponse) => void` | 收到推送时的回调函数       |


> 取消订阅：`myxClient.subscription.unsubscribeTickers(globalId, callback)`

### subscription.subscribeKline `[WS]`

订阅指定池和时间粒度的 K 线实时推送。

**入参：**


| 参数名        | 类型                                  | 说明          |
| ---------- | ----------------------------------- | ----------- |
| globalId   | `number`                            | 池的 globalId |
| resolution | `KlineResolution`                   | K 线时间粒度     |
| callback   | `(data: KlineDataResponse) => void` | 收到推送时的回调函数  |


> 取消订阅：`myxClient.subscription.unsubscribeKline(globalId, resolution, callback)`

### subscription.auth `[WS]`

WebSocket 私有订阅鉴权，订阅订单或持仓推送前必须调用。

> 私有订阅前必须调用

### subscription.subscribeOrder `[WS]`

订阅当前账户的订单状态变更推送（创建/成交/取消）。

> 需先调用 `auth()`

**入参：**


| 参数名      | 类型                    | 说明           |
| -------- | --------------------- | ------------ |
| callback | `(data: any) => void` | 订单状态变更时的回调函数 |


> 取消订阅：`myxClient.subscription.unsubscribeOrder(callback)`

### subscription.subscribePosition `[WS]`

订阅当前账户的持仓状态变更推送（开启/修改/关闭）。

> 需先调用 `auth()`

**入参：**


| 参数名      | 类型                    | 说明           |
| -------- | --------------------- | ------------ |
| callback | `(data: any) => void` | 持仓状态变更时的回调函数 |


> 取消订阅：`myxClient.subscription.unsubscribePosition(callback)`

---

## 10. 争议模块 appeal

针对异常或阻塞状态交易的申诉与处理模块。当用户申诉等罕见情况导致订单状态进入锁定（Appeal）后，依靠本模块解冻被异常扣押的保证金。

### 链上交易方法 `[混合/链上]`


| 方法                                 | 说明                  |
| ---------------------------------- | ------------------- |
| `submitAppeal(params)`             | 提交争议（含 oracle 时为混合） |
| `voteForAppeal(params)`            | 节点投票                |
| `claimAppealMargin(params)`        | 领取争议保证金             |
| `claimReimbursement(params)`       | 领取赔付                |
| `getDisputeConfiguration(chainId)` | 获取争议配置              |
| `submitAppealByVoteNode(params)`   | 节点提交争议              |
| `appealReconsideration(params)`    | 申请复议                |


### HTTP 方法 `[后端]`


| 方法                                          | 说明     |
| ------------------------------------------- | ------ |
| `getAppealList(params)`                     | 争议列表   |
| `getAppealDetail(appealId)`                 | 争议详情   |
| `uploadAppealEvidence(params)`              | 上传证据   |
| `getAppealReconsiderationList(params)`      | 复议列表   |
| `getAppealStatus(poolId, chainId, address)` | 池争议状态  |
| `getAppealNodeVoteList(params)`             | 节点投票列表 |
| `postVoteSignature(params)`                 | 提交投票签名 |


---

## 11. 返佣模块 referrals

处理并结算推荐体系奖金的基础业务入口。支持针对特定邀请对象关联、下发手续费折扣及提取当前盈余的分成或返现。

### referrals.claimRebate `[链上]`

领取当前账户在指定代币下累积的返佣奖励。

**入参：**


| 参数名          | 类型       | 说明         |
| ------------ | -------- | ---------- |
| tokenAddress | `string` | 要领取返佣的代币地址 |


**返回值：**


| 字段  | 类型                   | 说明     |
| --- | -------------------- | ------ |
| —   | `TransactionReceipt` | 链上交易回执 |


---

## 12. 附录

### 环境地址


| 条件                  | 后端 Base URL                    |
| ------------------- | ------------------------------ |
| `isBetaMode = true` | `https://api-beta.myx.finance` |
| `isTestnet = true`  | `https://api-test.myx.cash`    |
| 主网                  | `https://api.myx.finance`      |


WebSocket 地址根据 `isBetaMode` / `isTestnet` 自动选择（见 `src/manager/const/socket.ts`）。

### 价格与精度约定


| 数据         | 精度     | 示例                              |
| ---------- | ------ | ------------------------------- |
| 价格         | 30 位小数 | `"3000…000"` = $3000（共 34 位）    |
| USDC 数量    | 6 位    | `"1000000"` = 1 USDC            |
| ETH / 仓位大小 | 18 位   | `"1000000000000000000"` = 1 ETH |
| 滑点         | bps    | `"100"` = 1%                    |


```typescript
import { ethers } from 'ethers';
const price = ethers.parseUnits("3000", 30).toString();
const amount = ethers.parseUnits("100", 6).toString(); // 100 USDC
```

### 常见错误码（SDK / HTTP）


| 错误码    | 含义             |
| ------ | -------------- |
| `0`    | 成功             |
| `-1`   | 通用错误           |
| `9401` | AccessToken 过期 |
| `9403` | 未授权            |


### 合约错误码（链上 Revert）

链上交易 revert 时，合约抛出以下标准化错误。可用 `utils.formatErrorMessage(error)` 将其转换为可读文本。

#### 权限


| 错误签名                                | 选择器          | 说明       |
| ----------------------------------- | ------------ | -------- |
| `PermissionDenied(address,address)` | `0xe03f6024` | 无权操作目标合约 |
| `NotOrderOwner()`                   | `0xf6412b5a` | 非订单所有者   |
| `NotPositionOwner()`                | `0x70d645e3` | 非仓位所有者   |
| `NotActiveBroker(address)`          | `0x27d08510` | 经纪人未激活   |
| `OnlyRelayer()`                     | `0x4578ddb8` | 仅中继器可调用  |


#### 订单


| 错误签名                                             | 选择器          | 说明         |
| ------------------------------------------------ | ------------ | ---------- |
| `InvalidOrder(bytes32)`                          | `0xd8cf2fdb` | 订单无效或参数不合法 |
| `OrderExpired(bytes32)`                          | `0x2e775cae` | 订单已过期      |
| `OrderNotExist(bytes32)`                         | `0x3b51fbd2` | 订单不存在      |
| `NotReachedPrice(bytes32,uint256,uint256,uint8)` | `0xc1d5fb38` | 价格未达触发条件   |


#### 仓位


| 错误签名                                      | 选择器          | 说明                 |
| ----------------------------------------- | ------------ | ------------------ |
| `InvalidPosition(bytes32)`                | `0x8ea9158f` | 仓位无效或参数不合法         |
| `PositionNotHealthy(bytes32,uint256)`     | `0xa5afd143` | 保证金率低于维持保证金率（触发清算） |
| `PositionRemainsHealthy(bytes32)`         | `0xc53f84e7` | 仓位健康，无法清算          |
| `InsufficientCollateral(bytes32,uint256)` | `0x5646203f` | 保证金不足              |
| `ExceedMaxLeverage(bytes32)`              | `0xb4762117` | 超过最大杠杆倍数           |


#### 流动性与余额


| 错误签名                                             | 选择器          | 说明              |
| ------------------------------------------------ | ------------ | --------------- |
| `InsufficientBalance(address,uint256,uint256)`   | `0xdb42144d` | 账户余额不足          |
| `InsufficientLiquidity(uint256,uint256,uint256)` | `0xd54d0fc4` | 池流动性不足          |
| `InsufficientOutputAmount()`                     | `0x42301c23` | 输出低于最小值（滑点保护触发） |
| `InsufficientSize()`                             | `0xc6e8248a` | 订单/仓位数量不足       |


#### 价格与预言机


| 错误签名                        | 选择器          | 说明          |
| --------------------------- | ------------ | ----------- |
| `StalePrice()`              | `0x19abf40e` | 价格数据过期      |
| `InvalidPrice()`            | `0x00bfc921` | 价格无效或为零     |
| `ExceedMaxPriceDeviation()` | `0xfd0f789d` | 价格偏差超过最大允许值 |


#### 市场与池


| 错误签名                      | 选择器          | 说明        |
| ------------------------- | ------------ | --------- |
| `PoolNotExist(bytes32)`   | `0x51aeee6c` | 池不存在      |
| `PoolNotActive(bytes32)`  | `0xba01b06f` | 池未激活，无法交易 |
| `MarketNotExist(bytes32)` | `0x24e219c7` | 市场不存在     |


#### 其他


| 错误签名                 | 选择器          | 说明       |
| -------------------- | ------------ | -------- |
| `InvalidParameter()` | `0x613970e0` | 参数无效     |
| `TransferFailed()`   | `0x90b8ec18` | 代币转账失败   |
| `NoRebateToClaim()`  | `0x80577032` | 没有可领取的返佣 |


### 类型文件位置


| 文件                           | 内容                      |
| ---------------------------- | ----------------------- |
| `src/types/trading.ts`       | `PlaceOrderParams`、交易枚举 |
| `src/types/order.ts`         | 订单更新类型                  |
| `src/api/type.ts`            | HTTP 响应包裹与 DTO          |
| `src/manager/error/const.ts` | SDK 错误码                 |
| `lp/pool/type.ts`            | LP 池相关类型                |


