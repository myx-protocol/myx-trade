# MYX Trade SDK 快速开始

专注于杠杆交易的强大 SDK

## 30秒快速集成

### 1. 安装

```bash
npm install @myx-trade/sdk ethers
```

### 2. 导入并使用

```typescript
import { placeOrder, OrderType, Direction, OperationType, TimeInForce } from '@myx-trade/sdk';
import { BrowserProvider } from 'ethers';

// 连接钱包
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 下市价单买入 1 ETH
const result = await placeOrder({
  chainId: 421614, // Arbitrum Sepolia
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
}, signer);

console.log('交易哈希:', result.hash);
```

### 3. 完整的 React 组件示例

```typescript
import React, { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { placeOrder, OrderType, Direction, OperationType, TimeInForce } from '@myx-trade/sdk';
import { BrowserProvider } from 'ethers';

export const QuickTradeButton: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!walletClient) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const result = await placeOrder({
        chainId: 421614,
        address: await signer.getAddress(),
        poolId: '0x5cd0bc68073c63064c9820d395a8c4c1225bc43eca47e39903b5193f9585a2ec',
        orderType: OrderType.MARKET,
        operation: OperationType.INCREASE,
        direction: Direction.LONG,
        collateralAmount: '10000000',
        size: '1000000000000000000',
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct: '500',
        executionFeeToken: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
        leverage: 10
      }, signer);

      alert(`交易成功! 哈希: ${result.hash}`);
    } catch (error) {
      alert(`交易失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleTrade} 
      disabled={!walletClient || loading}
      style={{
        padding: '12px 24px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      {loading ? '交易中...' : '买入 1 ETH (10x 杠杆)'}
    </button>
  );
};
```

## 重要提醒

- 🔗 **网络**: 请确保钱包连接到 Arbitrum Sepolia 测试网 (Chain ID: 421614)
- 💰 **测试币**: 从 [Arbitrum Faucet](https://faucet.triangleplatform.com/arbitrum/sepolia) 获取测试 ETH
- 🪙 **USDC**: 测试网 USDC 地址 `0x7E248Ec1721639413A280d9E82e2862Cae2E6E28`
- 🔢 **精度**: 注意代币精度（USDC: 6位，ETH: 18位）

## 下一步

- 查看 [完整文档](./SDK_DOCUMENTATION.md)
- 探索 [示例项目](./packages/playground)
- 加入我们的 [Discord 社区](https://discord.gg/myx)
