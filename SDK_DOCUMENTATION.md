# MYX Trade SDK 技术文档

## 目录

1. [概述](#概述)
2. [快速开始](#快速开始)
3. [安装](#安装)
4. [初始化配置](#初始化配置)
5. [交易 API 参考](#交易-api-参考)
6. [错误处理](#错误处理)
7. [示例代码](#示例代码)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)
10. [更新日志](#更新日志)

---

## 概述

MYX Trade SDK 是一个用于与 MYX 交易平台进行交互的 JavaScript/TypeScript 库。它提供了简单易用的 API 来执行杠杆交易操作和订单管理。

### 主要功能

- ✅ 交易订单管理（下单、取消、查询）
- ✅ 实时价格数据获取
- ✅ 钱包集成支持
- ✅ 多链支持（Arbitrum、BSC 等）
- ✅ TypeScript 完整类型支持
- ✅ 杠杆交易支持
- ✅ 止盈止损功能

### 支持的网络

| 网络 | Chain ID | 状态 |
|------|----------|------|
| Arbitrum Sepolia (测试网) | 421614 | ✅ 支持 |
| Arbitrum Mainnet | 42161 | 🚧 开发中 |
| BSC Testnet | 97 | 🚧 开发中 |
| BSC Mainnet | 56 | 🚧 开发中 |

---

## 快速开始

### 5 分钟集成示例

```typescript
import { placeOrder, OrderType, Direction } from '@myx-trade/sdk';
import { ethers } from 'ethers';

// 1. 连接钱包
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. 下市价单
const result = await placeOrder({
  chainId: 421614, // Arbitrum Sepolia
  address: '0x...',
  poolId: '0x5cd0bc68...',
  orderType: OrderType.MARKET,
  direction: Direction.LONG,
  collateralAmount: '1000000', // 1 USDC (6位精度)
  size: '1000000000000000000', // 1 ETH (18位精度)
  leverage: 10,
  slippagePct: '500' // 0.05% (4位精度)
}, signer);

console.log('订单已提交:', result.hash);
```

---

## 安装

### NPM 安装

```bash
npm install @myx-trade/sdk
```

### Yarn 安装

```bash
yarn add @myx-trade/sdk
```

### PNPM 安装

```bash
pnpm add @myx-trade/sdk
```

### 依赖要求

- Node.js >= 16.0.0
- ethers ^6.0.0
- TypeScript >= 4.5.0 (可选，但推荐)

---

## 初始化配置

### 基础配置

```typescript
import { createSDKConfig } from '@myx-trade/sdk';

const config = createSDKConfig({
  chainId: 421614, // Arbitrum Sepolia
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  apiBaseUrl: 'https://api-test.myx.cash',
  debug: true // 开发环境建议开启
});
```

### 高级配置

```typescript
import { SDKConfig, ChainConfig } from '@myx-trade/sdk';

const customChain: ChainConfig = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorers: ['https://sepolia.arbiscan.io'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

const config: SDKConfig = {
  chains: [customChain],
  defaultChainId: 421614,
  language: 'zh', // 支持 'en' | 'zh' | 'ja' | 'ko'
  debug: false,
};
```

---

## 交易 API 参考

### 核心交易功能

#### `placeOrder(params, signer)`

下单操作。

**参数:**

```typescript
interface PlaceOrderParams {
  chainId: number;           // 链 ID
  address: string;           // 用户地址
  poolId: string;           // 池子 ID
  positionId?: number;      // 仓位 ID（可选）
  orderType: OrderType;     // 订单类型
  triggerType?: TriggerType; // 触发类型（可选）
  operation: OperationType; // 操作类型
  direction: Direction;     // 方向
  collateralAmount: string; // 保证金数量
  size: string;            // 交易数量
  orderPrice?: string;     // 订单价格（可选）
  triggerPrice?: string;   // 触发价格（可选）
  timeInForce: TimeInForce; // 时间有效性
  postOnly: boolean;       // 仅挂单
  slippagePct: string;     // 滑点百分比
  executionFeeToken: string; // 执行费代币
  leverage: number;        // 杠杆倍数
  tpSize?: string;        // 止盈数量（可选）
  tpPrice?: string;       // 止盈价格（可选）
  slSize?: string;        // 止损数量（可选）
  slPrice?: string;       // 止损价格（可选）
}
```

**返回值:**

```typescript
interface TransactionResult {
  hash: string;           // 交易哈希
  chainId: number;        // 链 ID
  blockNumber?: number;   // 区块号
  gasUsed?: string;      // 消耗的 Gas
}
```

**示例:**

```typescript
const result = await placeOrder({
  chainId: 421614,
  address: '0x742d35Cc6634C0532925a3b8D6Ac6D5a5B458CB5',
  poolId: '0x5cd0bc68073c63064c9820d395a8c4c1225bc43eca47e39903b5193f9585a2ec',
  orderType: OrderType.MARKET,
  operation: OperationType.INCREASE,
  direction: Direction.LONG,
  collateralAmount: '10000000', // 10 USDC
  size: '1000000000000000000',  // 1 ETH
  timeInForce: TimeInForce.IOC,
  postOnly: false,
  slippagePct: '500', // 0.05%
  executionFeeToken: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
  leverage: 10
}, signer);
```

#### `cancelOrder(orderId, signer)`

取消订单。

**参数:**
- `orderId: string` - 订单 ID
- `signer: ethers.Signer` - 签名器

**返回值:**
- `Promise<TransactionResult>`

#### `cancelOrders(orderIds, signer)`

批量取消订单。

**参数:**
- `orderIds: string[]` - 订单 ID 数组
- `signer: ethers.Signer` - 签名器

**返回值:**
- `Promise<TransactionResult>`

### 数据查询 API

#### `getPools()`

获取所有交易池信息。

**返回值:**

```typescript
interface Pool {
  poolId: string;
  baseToken: string;
  quoteToken: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseDecimals: number;
  quoteDecimals: number;
  maxLeverage: number;
  state: number;
}
```

#### `getPoolLevel(poolId, chainId)`

获取池子配置信息。

**参数:**
- `poolId: string` - 池子 ID
- `chainId: number` - 链 ID

**返回值:**

```typescript
interface PoolLevel {
  level: number;
  levelName: string;
  levelConfig: {
    name: string;
    minOrderSizeInUsd: number;
    lockSeconds: number;
    lockPriceRate: number;
    lockLiquidity: number;
    maintainCollateralRate: number;
    leverage: number;
    fundingFeeRate1: number;
    fundingFeeRate1Max: number;
    fundingFeeRate2: number;
    fundingFeeSeconds: number;
    slip: number;
  };
}
```

#### `getOraclePrice(poolId, chainId)`

获取预言机价格。

**参数:**
- `poolId: string` - 池子 ID
- `chainId: number` - 链 ID

**返回值:**

```typescript
interface OraclePrice {
  price: string;
  timestamp: number;
}
```

### 类型定义

```typescript
// 订单类型
export enum OrderType {
  MARKET = 0,      // 市价单
  LIMIT = 1,       // 限价单
  STOP = 2,        // 止损单
  CONDITIONAL = 3  // 条件单
}

// 触发类型
export enum TriggerType {
  NONE = 0,  // 无触发
  GTE = 1,   // 大于等于
  LTE = 2    // 小于等于
}

// 操作类型
export enum OperationType {
  INCREASE = 0,  // 增加仓位
  DECREASE = 1   // 减少仓位
}

// 方向
export enum Direction {
  LONG = 0,   // 做多
  SHORT = 1   // 做空
}

// 时间有效性
export enum TimeInForce {
  IOC = 0  // 立即执行或取消
}
```

---

## 错误处理

### 错误类型

SDK 可能抛出以下类型的错误：

```typescript
// 网络错误
class NetworkError extends Error {
  constructor(message: string, public chainId: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

// 参数错误
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 合约错误
class ContractError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ContractError';
  }
}
```

### 错误处理示例

```typescript
try {
  const result = await placeOrder(params, signer);
  console.log('交易成功:', result.hash);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('网络错误:', error.message, '链ID:', error.chainId);
  } else if (error instanceof ValidationError) {
    console.error('参数验证失败:', error.field, error.message);
  } else if (error instanceof ContractError) {
    console.error('合约执行失败:', error.code, error.message);
  } else {
    console.error('未知错误:', error.message);
  }
}
```

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `INSUFFICIENT_BALANCE` | 余额不足 | 检查账户余额 |
| `INVALID_SLIPPAGE` | 滑点超限 | 调整滑点参数 |
| `POOL_NOT_FOUND` | 池子不存在 | 检查池子 ID |
| `NETWORK_MISMATCH` | 网络不匹配 | 切换到正确的网络 |
| `GAS_ESTIMATION_FAILED` | Gas 估算失败 | 检查交易参数 |

---

## 示例代码

### 完整的交易流程

```typescript
import React, { useState } from 'react';
import { 
  placeOrder, 
  OrderType, 
  Direction, 
  OperationType, 
  TimeInForce 
} from '@myx-trade/sdk';
import { useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';

export const TradingComponent: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!walletClient) return;

    setLoading(true);
    try {
      // 转换为 ethers.js signer
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      // 下单参数
      const orderParams = {
        chainId: 421614,
        address: await signer.getAddress(),
        poolId: '0x5cd0bc68073c63064c9820d395a8c4c1225bc43eca47e39903b5193f9585a2ec',
        orderType: OrderType.MARKET,
        operation: OperationType.INCREASE,
        direction: Direction.LONG,
        collateralAmount: '10000000', // 10 USDC
        size: '1000000000000000000',  // 1 ETH
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct: '500', // 0.05%
        executionFeeToken: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
        leverage: 10
      };

      // 执行交易
      const result = await placeOrder(orderParams, signer);
      
      console.log('交易成功:', result.hash);
      alert(`交易已提交，哈希: ${result.hash}`);
      
    } catch (error) {
      console.error('交易失败:', error);
      alert('交易失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleTrade} 
        disabled={!walletClient || loading}
      >
        {loading ? '交易中...' : '下单'}
      </button>
    </div>
  );
};
```

### 批量操作示例

```typescript
// 批量取消订单
const orderIds = ['order1', 'order2', 'order3'];
const result = await cancelOrders(orderIds, signer);

// 批量查询交易池信息
const pools = await getPools();
const poolLevels = await Promise.all(
  pools.map(pool => getPoolLevel(pool.poolId, 421614))
);

// 批量获取价格信息
const pricePromises = pools.map(pool => 
  getOraclePrice(pool.poolId, 421614)
);
const prices = await Promise.all(pricePromises);
```

### 实时价格监听

```typescript
import { getOraclePrice } from '@myx-trade/sdk';

const subscribeToPrice = (poolId: string, chainId: number) => {
  const interval = setInterval(async () => {
    try {
      const priceData = await getOraclePrice(poolId, chainId);
      console.log('当前价格:', priceData.price);
      // 更新 UI
    } catch (error) {
      console.error('获取价格失败:', error);
    }
  }, 5000); // 每5秒更新一次

  return () => clearInterval(interval);
};

// 使用
const unsubscribe = subscribeToPrice(
  '0x5cd0bc68073c63064c9820d395a8c4c1225bc43eca47e39903b5193f9585a2ec',
  421614
);

// 清理
// unsubscribe();
```

---

## 最佳实践

### 1. 错误处理

- 始终使用 try-catch 包装 SDK 调用
- 根据错误类型提供不同的用户反馈
- 记录详细的错误信息用于调试

### 2. 性能优化

- 缓存池子信息和配置数据
- 使用防抖处理频繁的价格查询
- 批量操作优于单个操作

### 3. 安全考虑

- 验证用户输入参数
- 检查网络连接状态
- 确保钱包连接安全

### 4. 用户体验

- 提供加载状态提示
- 显示交易进度和结果
- 处理网络切换场景

### 5. 数据精度处理

```typescript
import { BigNumber } from 'bignumber.js';

// 正确处理精度
const formatAmount = (amount: string, decimals: number): string => {
  return new BigNumber(amount)
    .multipliedBy(10 ** decimals)
    .toString();
};

// 示例：1 USDC (6位精度)
const usdcAmount = formatAmount('1', 6); // "1000000"

// 示例：1 ETH (18位精度)  
const ethAmount = formatAmount('1', 18); // "1000000000000000000"
```

---

## 常见问题

### Q: 为什么我的交易失败了？

**A:** 可能的原因包括：
- 余额不足
- 滑点设置过低
- 网络拥堵导致 Gas 费用过低
- 池子流动性不足

**解决方案:**
1. 检查账户余额
2. 适当增加滑点容忍度
3. 增加 Gas 费用
4. 选择流动性更好的池子

### Q: 如何计算正确的数量精度？

**A:** 每个代币都有不同的精度位数：
- USDC: 6位精度
- ETH: 18位精度  
- 使用 `BigNumber` 库进行精确计算

```typescript
// 1 USDC = 1 * 10^6 = 1000000
const usdcAmount = new BigNumber(1).multipliedBy(10 ** 6).toString();

// 0.1 ETH = 0.1 * 10^18 = 100000000000000000
const ethAmount = new BigNumber(0.1).multipliedBy(10 ** 18).toString();
```

### Q: SDK 支持哪些钱包？

**A:** SDK 支持所有兼容 EIP-1193 标准的钱包：
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet
- 等其他以太坊钱包

### Q: 如何处理网络切换？

**A:** 监听网络变化并更新配置：

```typescript
// 监听网络变化
window.ethereum?.on('chainChanged', (chainId: string) => {
  const newChainId = parseInt(chainId, 16);
  // 更新 SDK 配置
  updateSDKConfig({ defaultChainId: newChainId });
});
```

### Q: 测试网络如何获取测试代币？

**A:** Arbitrum Sepolia 测试网：
1. ETH: 从 [Arbitrum Sepolia Faucet](https://faucet.triangleplatform.com/arbitrum/sepolia) 获取
2. USDC: 使用合约地址 `0x7E248Ec1721639413A280d9E82e2862Cae2E6E28` 添加到钱包

---

## 更新日志

### v1.0.0 (2024-01-15)

**新功能:**
- ✅ 完整的交易功能（市价单、限价单、止损单、条件单）
- ✅ 杠杆交易支持（最高100倍杠杆）
- ✅ 止盈止损功能
- ✅ 批量订单管理
- ✅ 实时价格数据获取
- ✅ 完整的 TypeScript 类型支持
- ✅ Arbitrum Sepolia 测试网支持
- ✅ 错误处理和重试机制

**改进:**
- 📈 优化 Gas 费用估算算法
- 🛡️ 增强参数验证和错误处理
- 📚 完善文档和使用示例
- 🚀 提升交易执行性能

**修复:**
- 🐛 修复批量取消订单的 Gas 限制问题
- 🐛 修复精度计算错误
- 🐛 修复网络切换时的状态同步问题
- 🐛 修复滑点计算精度问题

### v0.9.0 (2024-01-01)

**新功能:**
- ✅ 初版 SDK 发布
- ✅ 基础交易功能（市价单、限价单）
- ✅ 基础订单管理

---

## 许可证

MIT License

---

## 支持与反馈

如果您在使用过程中遇到问题或有建议，请通过以下方式联系我们：

- 📧 Email: support@myx.cash
- 💬 Discord: [MYX Community](https://discord.gg/myx)
- 🐛 Issues: [GitHub Issues](https://github.com/myx-trade/sdk/issues)
- 📖 Documentation: [MYX Docs](https://docs.myx.cash)

---

**最后更新:** 2024年1月15日
