# MYX Trade SDK 接入指南

## 概述

MYX Trade SDK 是一个用于衍生品交易的 TypeScript/JavaScript SDK，提供了完整的交易功能，包括下单、仓位管理、订单管理等功能。

## 安装

```bash
npm install @myx-trade/sdk
# 或
yarn add @myx-trade/sdk
# 或
pnpm add @myx-trade/sdk
```

## 快速开始

### 1. 初始化 SDK 客户端

```typescript
import { MyxClient } from '@myx-trade/sdk';
import { BrowserProvider } from 'ethers';

// 从 wagmi 钱包客户端创建 ethers signer
const provider = new BrowserProvider(walletClient.transport);
const signer = await provider.getSigner();

// 初始化 MYX 客户端
const myxClient = new MyxClient({
  chainId: 421614, // Arbitrum Sepolia 测试网
  signer: signer,
  brokerAddress: "0xDb25D3f37f2d35005582fb7Bdf126C0EF7738106",
  isTestnet: true
});
```

### 2. 配置访问令牌（AccessToken）

在使用需要认证的功能（如查询仓位、订单等）之前，需要配置访问令牌：

```typescript
import CryptoJS from "crypto-js";

// AccessToken 获取函数
const getAccessToken = async (appId: string, timestamp: number, expireTime: number, allowAccount: string, signature: string) => {
  try {
    const rs = await fetch(`https://api-test.myx.cash/openapi/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`)
    const res = await rs.json();

    return {
      code: 0,
      msg: null,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
        allowAccount: res.data.allowAccount,
        appId: appId,
      },
    };
  } catch (error) {
    console.error("getAccessToken error-->", error);
    return {
      code: -1,
      msg: "getAccessToken error",
      data: {
        accessToken: "",
        expireAt: 0,
        allowAccount: "",
        appId: "",
      },
    };
  }
};

// 配置 AccessToken
const handleAccessToken = async () => {
  const appId = "test1";
  const timestamp = Math.floor(Date.now() / 1000);
  const expireTime = 3600 * 24; // 24小时
  const allowAccount = address; // 钱包地址
  const secret = "69v9kHey9b746PseJ0TP";

  const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
  const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);

  const configManager = myxClient.getConfigManager();
  const args = [appId, timestamp, expireTime, address!, signature];
  
  const configResponse = await configManager.callGetAccessToken(getAccessToken, args);
  
  if (configResponse) {
    console.log('✅ AccessToken 已成功获取并存储到 SDK 中');
  } else {
    console.error('❌ AccessToken 获取或存储失败');
  }
};
```

## 核心功能

### 交易功能

#### 1. 下单交易

```typescript
// 构建订单数据
const orderData = {
  chainId: 421614,
  address: address as `0x${string}`,
  poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  positionId: operation === OperationType.DECREASE && positionId ? parseInt(positionId) : 0,
  orderType: OrderType.LIMIT, // 订单类型：市价单/限价单/止损单/条件单
  triggerType: TriggerType.NONE, // 触发类型：无/大于等于/小于等于
  operation: OperationType.INCREASE, // 操作类型：增加/减少
  direction: Direction.LONG, // 方向：做多/做空
  collateralAmount: "1000000000", // 保证金数量（wei格式）
  size: "1000000000000000000", // 交易数量（wei格式）
  orderPrice: "3000000000000000000000000000000000", // 订单价格（30位小数）
  triggerPrice: "0", // 触发价格
  timeInForce: TimeInForce.IOC,
  postOnly: false,
  slippagePct: "100", // 滑点（万分之）
  executionFeeToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28", // 执行费代币
  leverage: 10,
  tpSize: "0", // 止盈数量
  tpPrice: "0", // 止盈价格
  slSize: "0", // 止损数量
  slPrice: "0", // 止损价格
};

// 执行下单
const result = await myxClient.trading.placeOrder(orderData);

if (result.success) {
  console.log('订单创建成功');
  console.log('订单ID:', result.orderId);
  console.log('交易哈希:', result.transactionHash);
} else {
  console.error('订单创建失败:', result.message);
}
```

#### 2. 取消订单

```typescript
// 取消单个订单
const cancelResult = await myxClient.trading.cancelOrder("107");

if (cancelResult.code === 0) {
  console.log('订单取消成功');
} else {
  console.error('订单取消失败:', cancelResult.message);
}

// 批量取消订单
const cancelMultipleResult = await myxClient.trading.cancelOrders(["107", "108", "109"]);
```

#### 3. USDC 授权

```typescript
// 检查是否需要授权
const needsApproval = await myxClient.trading.needsApproval(
  "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28", // USDC 地址
  "1000000000", // 需要的金额
  address // 用户地址（可选）
);

if (needsApproval) {
  // 执行授权
  const approvalResult = await myxClient.trading.approveAuthorization({
    quoteAddress: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
    amount: "1000000000" // 或使用 ethers.MaxUint256 进行无限授权
  });
  
  if (approvalResult.success) {
    console.log('授权成功');
  }
}

// 查询当前授权额度
const approvedAmount = await myxClient.trading.getApproveQuoteAmount(
  "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  address
);
console.log('当前授权额度:', approvedAmount);
```

### 仓位管理

#### 1. 查询仓位列表

```typescript
const positionsResult = await myxClient.position.listPositions();

if (positionsResult.code === 0) {
  const positions = positionsResult.data;
  console.log('仓位列表:', positions);
  
  // 仓位数据结构：
  // {
  //   chainId: 421614,
  //   collateralAmount: "997.31294",
  //   direction: 1, // 0=做多, 1=做空
  //   entryPrice: "4217.6517",
  //   fundingRateIndex: "446540232108.68586039",
  //   poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  //   positionId: 14,
  //   riskTier: 1,
  //   size: "2",
  //   txTime: 1758619397
  // }
}
```

#### 2. 平仓操作

```typescript
const closeResult = await myxClient.position.closePosition("14");

if (closeResult.code === 0) {
  console.log('平仓成功');
} else {
  console.error('平仓失败:', closeResult.message);
}
```

#### 3. 调整保证金

```typescript
// 调整保证金（正数增加，负数减少）
const adjustResult = await myxClient.position.adjustCollateral(
  "14", // 仓位ID
  "100" // 调整金额
);

if (adjustResult.code === 0) {
  console.log('保证金调整成功');
} else {
  console.error('保证金调整失败:', adjustResult.message);
}
```

### 订单管理

#### 1. 查询订单列表

```typescript
const ordersResult = await myxClient.order.getOrders();

if (ordersResult.code === 0) {
  const orders = ordersResult.data;
  console.log('订单列表:', orders);
  
  // 订单数据结构：
  // {
  //   chainId: 421614,
  //   collateralAmount: "1000",
  //   direction: 0, // 0=做多, 1=做空
  //   executionFeeAmount: "1",
  //   executionFeeToken: "0x7e248ec1721639413a280d9e82e2862cae2e6e28",
  //   filledAmount: "0",
  //   filledSize: "0",
  //   operation: 0, // 0=增加, 1=减少
  //   orderId: 107,
  //   orderType: 1, // 0=市价, 1=限价, 2=止损, 3=条件
  //   poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  //   postOnly: 0,
  //   price: "3000",
  //   size: "1",
  //   slPrice: null,
  //   slSize: null,
  //   slippagePct: 10,
  //   tif: 0,
  //   tpPrice: null,
  //   tpSize: null,
  //   triggerType: 2,
  //   txHash: "0x099ca47f20bacf1e8840ece3551baed337e2783941cc3d74341786db678b1524",
  //   txTime: 1758619236,
  //   user: "0x264bcafdf8a270f9bf8a0ef48078eae930a2ed52",
  //   userLeverage: 10
  // }
}
```

### 市场数据

#### 1. 获取交易池列表

```typescript
import { getPools } from '@myx-trade/sdk';

const poolsData = await getPools();
const pools = poolsData.data;

// 交易池数据结构：
// {
//   poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
//   baseSymbol: "ETH",
//   quoteSymbol: "USDT",
//   baseDecimals: 18,
//   quoteDecimals: 6,
//   baseToken: "0x...",
//   quoteToken: "0x...",
//   state: 2, // 2=可交易
//   maxLeverage: 50
// }
```

#### 2. 获取预言机价格

```typescript
import { getOraclePrice } from '@myx-trade/sdk';

const priceData = await getOraclePrice(421614, [poolId]);
const price = priceData.data[0]?.price;
```

#### 3. 获取池子配置

```typescript
import { getPoolLevelConfig } from '@myx-trade/sdk';

const levelData = await getPoolLevelConfig({
  poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  chainId: 421614
});

const config = levelData.data.levelConfig;
// {
//   fundingFeeRate1: 0.0003,
//   fundingFeeRate1Max: 0.003,
//   fundingFeeRate2: 0.003,
//   fundingFeeSeconds: 14400,
//   leverage: 50,
//   lockLiquidity: 3000000,
//   lockPriceRate: 0.03,
//   lockSeconds: 14400,
//   maintainCollateralRate: 0.01,
//   minOrderSizeInUsd: 100,
//   name: "A",
//   slip: 0.001
// }
```
### LP 管理
#### 1. 创建lp

```typescript
import { pool } from "@myx-trade/sdk";

try {
  setIsLoading(true);
  const poolId = await pool.createPool({chainId,  baseToken: address });
  if (!poolId) return;
  
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setIsLoading(false)
}
```

#### 2. Deposit Lp by Quote

```typescript
import {quote} from "@myx-trade/sdk";

const {poolId} = '创建lp返回的poolId，or 列表中的poolId'
const [amount, setAmount] = useState<string>('2000')
const [slippage, setSlippage] = useState<string>('0.01')

try {
  setIsDepositLoading(true)
  await quote.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  // message.success("Deposit success")
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setIsDepositLoading(false)
}
```

#### 3. withdraw lp Quote

```typescript
import {quote} from "@myx-trade/sdk";

const {poolId} = '创建lp返回的poolId，or 列表中的poolId'
const [amount, setAmount] = useState<string>('2000')
const [slippage, setSlippage] = useState<string>('0.01')

try {
  setIsLoading(true)
  await quote.withdraw({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  message.success("Withdraw success")
} finally {
  setIsLoading(false)
}
```


#### 4. deposit lp Base

```typescript
import {base} from "@myx-trade/sdk";

const {poolId} = '创建lp返回的poolId，or 列表中的poolId'
const [amount, setAmount] = useState<string>('0.01')
const [slippage, setSlippage] = useState<string>('0.01')

try {
  setIsLoading(true)
  await base.quote({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  message.success("Withdraw success")
} finally {
  setIsLoading(false)
}
```

#### 5. withdraw lp Base

```typescript
import {base} from "@myx-trade/sdk";

const {poolId} = '创建lp返回的poolId，or 列表中的poolId'
const [amount, setAmount] = useState<string>('0.01')
const [slippage, setSlippage] = useState<string>('0.01')

try {
  setIsWithdrawLoading(true)
  await base.withdraw({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  message.success("Withdraw success")
} catch(e) {
  message.error(JSON.stringify(e))
} finally {
  setIsWithdrawLoading(false)
}
```

#### 6. get quote lp price

```typescript
import { quote, formatUnits } from "@myx-trade/sdk";

if (!poolId ) return null
const result = await quote.getLpPrice(
  chainId,
  poolId,
)
if (result) {
  return formatUnits(result, COMMON_PRICE_DECIMALS) // COMMON_PRICE_DECIMALS = 30
}
```

#### 7. get base lp price

```typescript
import { base, formatUnits } from "@myx-trade/sdk";

if (!poolId ) return null
const result = await base.getLpPrice(
  chainId,
  poolId,
)
if (result) {
  return formatUnits(result, COMMON_PRICE_DECIMALS) // COMMON_PRICE_DECIMALS = 30
}
```


#### 8. add TPSL

```typescript
import {pool as Pool } from "@myx-trade/sdk";

const chainId = 421614
const poolId = 'poolId'
const [loading, setLoading] = useState(false)
const [tpAmount, setTpAmount] = useState<string | number>("")
const [tpPrice, setTpPrice] = useState<string | number>("")
const [slAmount, setSlAmount] = useState<string | number>("")
const [slPrice, setSlPrice] = useState<string | number>("")
const [slippage, setSlippage] = useState<string>('0.01')
const [poolType, setPoolType] = useState<Pool.PoolType>(Pool.PoolType.Base)

if (!poolId ) return
const tpsl = [
  {
    amount: Number(tpAmount),
    triggerPrice: Number(tpPrice),
    triggerType: Pool.TriggerType.TP
  },
  {
    amount: Number(slAmount),
    triggerPrice: Number(slPrice),
    triggerType: Pool.TriggerType.SL
  }
].filter((item) => item.amount && item.triggerPrice)

const params: Pool.AddTpSLParams = {
  slippage: Number(slippage),
  poolId,
  chainId,
  poolType: poolType,
  tpsl
}

try {
  setLoading(true)
  const rs = await Pool.addTpSl(params)
  // console.log("addTpSL ", rs)
  // message.success("AddTpSL success")
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setLoading(false)
}

```

#### 9. cancel TPSL order

```typescript
import { pool } from "@myx-trade/sdk";

const [orderId, setOrderId] = useState<string>('')

try {
  if (!orderId) return
  await pool.cancelTpSl({orderId, chainId})
  // message.success("Cancel Order successfully")
} catch (e) {
  // message.error(JSON.stringify(e))
} finally {
  setIsLoading(false)
}
```


#### 10. transfer

```typescript
import { quote } from "@myx-trade/sdk";

const [fromPool, setFromPool] = useState<string>(poolId || '')
const [toPool, setToPool] = useState<string>('')
const [amount, setAmount] = useState<number | string>(100)
const [loading, setLoading] = useState(false)

try {
  setLoading(true)
  await quote.transfer(chainId, fromPool, toPool, Number(amount))
  // message.success("Transfer success")
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setLoading(false)
}
```

#### 11. get base lp Rewards

```typescript
import { quote } from "@myx-trade/sdk";

const [fromPool, setFromPool] = useState<string>(poolId || '')
const [toPool, setToPool] = useState<string>('')
const [amount, setAmount] = useState<number | string>(100)
const [loading, setLoading] = useState(false)

try {
  setLoading(true)
  await quote.transfer(chainId, fromPool, toPool, Number(amount))
  // message.success("Transfer success")
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setLoading(false)
}
```

## 错误处理

### 自动 AccessToken 刷新

```typescript
// 在数据获取时自动处理 token 过期
useSWR("getPositionList", async () => {
  const res = await myxClient?.position.listPositions();
  
  if (res?.code !== 0) {
    // 如果 token 过期，自动刷新
    await handleAccessToken();
    return;
  }
  
  const positions = res?.data ?? [];
  setPositionsList(positions);
  return positions;
}, {
  refreshInterval: 5000,
});
```

### 常见错误码

- `code: 0` - 成功
- `code: -1` - 一般错误
- `code: 9401` - 身份验证失败
- `code: 9403` - 权限拒绝
- `code: 9404` - 资源不存在

## 完整示例

请参考 `packages/playground/src/pages/TradePage.tsx` 文件，其中包含了 SDK 的完整使用示例，包括：

- 客户端初始化
- 访问令牌配置
- 下单流程
- 仓位管理
- 订单管理
- 数据展示

## 依赖项

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

## 注意事项

1. **网络要求**：确保钱包连接到正确的网络（Arbitrum Sepolia 测试网：421614）
2. **授权检查**：在交易前检查 USDC 授权额度
3. **精度处理**：注意数值精度转换（wei、小数位等）
4. **错误处理**：妥善处理异步操作的错误情况
5. **访问令牌**：定期刷新 AccessToken 以确保 API 调用正常

## 技术支持

如有问题，请联系技术支持或查看更多示例代码。
