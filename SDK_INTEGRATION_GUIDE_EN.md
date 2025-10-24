# MYX Trade SDK Integration Guide

## Overview

MYX Trade SDK is a TypeScript/JavaScript SDK for derivatives trading, providing comprehensive trading functionality including order placement, position management, order management, and more.

## Installation

```bash
npm install @myx-trade/sdk
# or
yarn add @myx-trade/sdk
# or
pnpm add @myx-trade/sdk
```

## Quick Start

### 1. Initialize SDK Client

```typescript
import { MyxClient } from '@myx-trade/sdk';
import { BrowserProvider } from 'ethers';

// Create ethers signer from wagmi wallet client
const provider = new BrowserProvider(walletClient.transport);
const signer = await provider.getSigner();

// Initialize MYX client
const myxClient = new MyxClient({
  chainId: 421614, // Arbitrum Sepolia Testnet
  signer: signer,
  brokerAddress: "0xd3d5b9c4316468697D827389B79622F43BDF6483",
  isTestnet: true
});
```

### 2. Configure Access Token

Before using authenticated features (like querying positions, orders, etc.), you need to configure the access token:

```typescript
import CryptoJS from "crypto-js";

// AccessToken retrieval function
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

// Configure AccessToken
const handleAccessToken = async () => {
  const appId = "test1";
  const timestamp = Math.floor(Date.now() / 1000);
  const expireTime = 3600 * 24; // 24 hours
  const allowAccount = address; // Wallet address
  const secret = "69v9kHey9b746PseJ0TP";

  const payload = `${appId}&${timestamp}&${expireTime}&${allowAccount}&${secret}`;
  const signature = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);

  const configManager = myxClient.getConfigManager();
  const args = [appId, timestamp, expireTime, address!, signature];
  
  const configResponse = await configManager.callGetAccessToken(getAccessToken, args);
  
  if (configResponse) {
    console.log('✅ AccessToken successfully obtained and stored in SDK');
  } else {
    console.error('❌ AccessToken retrieval or storage failed');
  }
};
```

## Core Features

### Trading Functions

#### 1. Place Order

```typescript
// Build order data
const orderData = {
  chainId: 421614,
  address: address as `0x${string}`,
  poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
  positionId: operation === OperationType.DECREASE && positionId ? parseInt(positionId) : 0,
  orderType: OrderType.LIMIT, // Order type: Market/Limit/Stop/Conditional
  triggerType: TriggerType.NONE, // Trigger type: None/GTE/LTE
  operation: OperationType.INCREASE, // Operation: Increase/Decrease
  direction: Direction.LONG, // Direction: Long/Short
  collateralAmount: "1000000000", // Collateral amount (wei format)
  size: "1000000000000000000", // Trade size (wei format)
  orderPrice: "3000000000000000000000000000000000", // Order price (30 decimals)
  triggerPrice: "0", // Trigger price
  timeInForce: TimeInForce.IOC,
  postOnly: false,
  slippagePct: "100", // Slippage (basis points)
  executionFeeToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28", // Execution fee token
  leverage: 10,
  tpSize: "0", // Take profit size
  tpPrice: "0", // Take profit price
  slSize: "0", // Stop loss size
  slPrice: "0", // Stop loss price
};

// Execute order placement
const result = await myxClient.trading.placeOrder(orderData);

if (result.success) {
  console.log('Order created successfully');
  console.log('Order ID:', result.orderId);
  console.log('Transaction hash:', result.transactionHash);
} else {
  console.error('Order creation failed:', result.message);
}
```

#### 2. Cancel Orders

```typescript
// Cancel single order
const cancelResult = await myxClient.trading.cancelOrder("107");

if (cancelResult.code === 0) {
  console.log('Order cancelled successfully');
} else {
  console.error('Order cancellation failed:', cancelResult.message);
}

// Cancel multiple orders
const cancelMultipleResult = await myxClient.trading.cancelOrders(["107", "108", "109"]);
```

#### 3. USDC Approval

```typescript
// Check if approval is needed
const needsApproval = await myxClient.trading.needsApproval(
  "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28", // USDC address
  "1000000000", // Required amount
  address // User address (optional)
);

if (needsApproval) {
  // Execute approval
  const approvalResult = await myxClient.trading.approveAuthorization({
    quoteAddress: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
    amount: "1000000000" // Or use ethers.MaxUint256 for unlimited approval
  });
  
  if (approvalResult.success) {
    console.log('Approval successful');
  }
}

// Query current approved amount
const approvedAmount = await myxClient.trading.getApproveQuoteAmount(
  "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  address
);
console.log('Current approved amount:', approvedAmount);
```

### Position Management

#### 1. Query Position List

```typescript
const positionsResult = await myxClient.position.listPositions();

if (positionsResult.code === 0) {
  const positions = positionsResult.data;
  console.log('Position list:', positions);
  
  // Position data structure:
  // {
  //   chainId: 421614,
  //   collateralAmount: "997.31294",
  //   direction: 1, // 0=Long, 1=Short
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

#### 2. Close Position

```typescript
const closeResult = await myxClient.position.closePosition("14");

if (closeResult.code === 0) {
  console.log('Position closed successfully');
} else {
  console.error('Position closing failed:', closeResult.message);
}
```

#### 3. Adjust Collateral

```typescript
// Adjust collateral (positive to add, negative to reduce)
const adjustResult = await myxClient.position.adjustCollateral(
  "14", // Position ID
  "100" // Adjustment amount
);

if (adjustResult.code === 0) {
  console.log('Collateral adjusted successfully');
} else {
  console.error('Collateral adjustment failed:', adjustResult.message);
}
```

### Order Management

#### 1. Query Order List

```typescript
const ordersResult = await myxClient.order.getOrders();

if (ordersResult.code === 0) {
  const orders = ordersResult.data;
  console.log('Order list:', orders);
  
  // Order data structure:
  // {
  //   chainId: 421614,
  //   collateralAmount: "1000",
  //   direction: 0, // 0=Long, 1=Short
  //   executionFeeAmount: "1",
  //   executionFeeToken: "0x7e248ec1721639413a280d9e82e2862cae2e6e28",
  //   filledAmount: "0",
  //   filledSize: "0",
  //   operation: 0, // 0=Increase, 1=Decrease
  //   orderId: 107,
  //   orderType: 1, // 0=Market, 1=Limit, 2=Stop, 3=Conditional
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

### Market Data

#### 1. Get Trading Pool List

```typescript
import { getPools } from '@myx-trade/sdk';

const poolsData = await getPools();
const pools = poolsData.data;

// Trading pool data structure:
// {
//   poolId: "0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d",
//   baseSymbol: "ETH",
//   quoteSymbol: "USDT",
//   baseDecimals: 18,
//   quoteDecimals: 6,
//   baseToken: "0x...",
//   quoteToken: "0x...",
//   state: 2, // 2=Tradable
//   maxLeverage: 50
// }
```

#### 2. Get Oracle Price

```typescript
import { getOraclePrice } from '@myx-trade/sdk';

const priceData = await getOraclePrice(421614, [poolId]);
const price = priceData.data[0]?.price;
```

#### 3. Get Pool Configuration

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

### LP Manage
#### 1. create LP

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
  await base.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
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

#### 11. get pool detail

```typescript
import { pool } from "@myx-trade/sdk";

const poolId = 'poolId'
await pool.getPoolDetail(poolId)

```

#### 12. get base lp Rewards

```typescript
import { base, pool as Pool } from "@myx-trade/sdk";

const pool = await Pool.getPoolDetail(poolId)

const result = await base.getRewards({
  poolId,
  chainId,
  account
})

const rewards = formatUnits(result, pool?.quoteDecimals)
```

#### 13. claim base lp Rewards

```typescript
import { base } from "@myx-trade/sdk";

const poolId = 'poolId'

try {
  setLoading(true)
  await base.claim({chainId, poolId})
  // message.success("Claim successfully claimed")
} catch(e) {
  // message.error(JSON.stringify(e))
} finally {
  setLoading(false)
}
```

#### 14. get quote lp Rewards

```typescript
import { quote, pool as Pool } from "@myx-trade/sdk";

const pool = await Pool.getPoolDetail(poolId)

const result = await quote.getRewards({
  poolId,
  chainId,
  account
})

const rewards = formatUnits(result, pool?.quoteDecimals)
```

#### 15. claim quote lp Rewards

```typescript
import { quote } from "@myx-trade/sdk";

const poolId = 'poolId'

await quote.claim({chainId, poolId})
```

## Error Handling

### Automatic AccessToken Refresh

```typescript
// Automatically handle token expiration during data fetching
useSWR("getPositionList", async () => {
  const res = await myxClient?.position.listPositions();
  
  if (res?.code !== 0) {
    // If token expires, automatically refresh
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

### Common Error Codes

- `code: 0` - Success
- `code: -1` - General error
- `code: 9401` - Authentication failed
- `code: 9403` - Permission denied
- `code: 9404` - Resource not found

## Complete Example

Please refer to the `packages/playground/src/pages/TradePage.tsx` file, which contains a complete usage example of the SDK, including:

- Client initialization
- Access token configuration
- Order placement flow
- Position management
- Order management
- Data display

## Dependencies

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

## Important Notes

1. **Network Requirements**: Ensure wallet is connected to the correct network (Arbitrum Sepolia Testnet: 421614)
2. **Authorization Check**: Check USDC approval allowance before trading
3. **Precision Handling**: Pay attention to numerical precision conversion (wei, decimals, etc.)
4. **Error Handling**: Properly handle errors in asynchronous operations
5. **Access Token**: Regularly refresh AccessToken to ensure API calls work properly

## Technical Support

For questions, please contact technical support or check for more example code.
