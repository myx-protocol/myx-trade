---
sidebar_position: 1
---

# MYX Trade SDK

Welcome to MYX Trade SDK! This is a powerful JavaScript/TypeScript SDK for interacting with the MYX trading platform.

## Key Features

### 🔗 Wallet Connection
- Support for multiple wallet providers (MetaMask, WalletConnect, etc.)
- Automatic wallet detection
- Connection state management

### 📊 Real-time Data Subscription
- WebSocket real-time price updates
- K-line data subscription
- Market depth information
- User order and position data

### 💱 Trading Features
- Spot trading
- Limit and market orders
- Order management
- Position management

### 🏦 Liquidity Pool Operations
- Add/remove liquidity
- Liquidity mining
- Yield calculation

## Quick Start

### Installation

```bash
npm install @myx-trade/sdk
```

### Basic Usage

```javascript
import { MyxClient } from '@myx-trade/sdk';
import { ethers } from 'ethers';

// Initialize SDK
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new MyxClient({
  chainId: 1,
  signer: signer,
  brokerAddress: '0x...', // Your broker address
  isTestnet: false
});

// Connect WebSocket
await client.subscription.connect();

// Subscribe to real-time price data
client.subscription.subscribeTickers(1, (data) => {
  console.log('BTC/USDT price update:', data);
});
```

## Core Modules

- **[Subscription Module](./subscription)** - Real-time data subscription and WebSocket connection management
- **[SDK Integration Guide](./SDK_INTEGRATION_GUIDE)** - Complete SDK integration guide with usage examples for all modules

---

**Note**: This SDK is still under active development, and the API may change. Please check the changelog regularly.