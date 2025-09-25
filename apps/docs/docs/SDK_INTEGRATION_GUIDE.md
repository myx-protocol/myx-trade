---
sidebar_position: 3
---

# SDK Integration Guide

This guide will help you quickly integrate MYX Trade SDK into your application.

## Installation

```bash
npm install @myx-trade/sdk
```

## Basic Configuration

### Initialize MyxClient

```javascript
import { MyxClient } from '@myx-trade/sdk';
import { ethers } from 'ethers';

// Create ethers provider and signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Initialize SDK
const client = new MyxClient({
  chainId: 1,                    // Chain ID
  signer: signer,                // Signer
  brokerAddress: '0x...',        // Broker address
  isTestnet: false,              // Whether testnet
  poolingInterval: 5000,         // Polling interval (milliseconds)
  seamlessMode: false,           // Seamless mode
  logLevel: 'info'               // Log level
});
```

### Configuration Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainId` | `number` | ✅ | Blockchain network ID |
| `signer` | `Signer` | ✅ | ethers.js signer instance |
| `brokerAddress` | `string` | ✅ | Broker contract address |
| `isTestnet` | `boolean` | ❌ | Whether test network (default: false) |
| `poolingInterval` | `number` | ❌ | Polling interval in milliseconds (default: 5000) |
| `seamlessMode` | `boolean` | ❌ | Seamless mode (default: false) |
| `socketConfig` | `object` | ❌ | WebSocket configuration options |
| `logLevel` | `string` | ❌ | Log level (debug/info/warn/error) |

## Core Modules

### 1. Subscription Module

For subscribing to real-time data:

```javascript
// Connect WebSocket
await client.subscription.connect();

// Subscribe to price data
client.subscription.subscribeTickers(1, (data) => {
  console.log('Price update:', data);
});

// Subscribe to K-line data
client.subscription.subscribeKline(1, '1m', (data) => {
  console.log('K-line data:', data);
});

// Authenticate and subscribe to private data
await client.subscription.auth();
await client.subscription.subscribeOrder((data) => {
  console.log('Order update:', data);
});
```

### 2. Trading Module

For executing trading operations:

```javascript
// Get trading instance
const trading = client.trading;

// Create order
const order = await trading.createOrder({
  market: 'BTC/USDT',
  side: 'buy',
  type: 'limit',
  amount: '0.001',
  price: '50000'
});

// Cancel order
await trading.cancelOrder(order.id);
```

### 3. Markets Module

For querying market data:

```javascript
// Get market information
const markets = await client.markets.getMarkets();

// Get specific market information
const btcMarket = await client.markets.getMarket(1);

// Get market depth
const depth = await client.markets.getMarketDepth(1);
```

### 4. Position Module

For managing positions:

```javascript
// Get user positions
const positions = await client.position.getPositions();

// Get specific position
const position = await client.position.getPosition(1);
```

### 5. Order Module

For managing orders:

```javascript
// Get user orders
const orders = await client.order.getOrders();

// Get specific order
const order = await client.order.getOrder('order-id');
```

## WebSocket Configuration

```javascript
const client = new MyxClient({
  // ... other configurations
  socketConfig: {
    // Initial reconnection delay (milliseconds)
    initialReconnectDelay: 1000,
    // Maximum reconnection delay (milliseconds)
    maxReconnectDelay: 30000,
    // Reconnection delay multiplier
    reconnectMultiplier: 1.5,
    // Maximum reconnection attempts
    maxReconnectAttempts: 10,
    // Maximum message queue length
    maxEnqueuedMessages: 100,
    // Request timeout (milliseconds)
    requestTimeout: 5000,
    // Heartbeat interval (milliseconds)
    heartbeatInterval: 30000,
    // No message timeout (milliseconds)
    noMessageTimeout: 60000
  }
});
```

## Complete Examples

### React Component Example

```jsx
import React, { useEffect, useState } from 'react';
import { MyxClient } from '@myx-trade/sdk';
import { ethers } from 'ethers';

function TradingApp() {
  const [client, setClient] = useState(null);
  const [price, setPrice] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function initClient() {
      try {
        // Initialize client
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const myxClient = new MyxClient({
          chainId: 1,
          signer: signer,
          brokerAddress: '0x...',
          isTestnet: false
        });

        // Connect WebSocket
        await myxClient.subscription.connect();

        // Subscribe to price data
        myxClient.subscription.subscribeTickers(1, (data) => {
          setPrice(data.data.p);
        });

        // Authenticate and subscribe to order data
        await myxClient.subscription.auth();
        myxClient.subscription.subscribeOrder((data) => {
          setOrders(prev => [...prev, data]);
        });

        setClient(myxClient);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    }

    initClient();

    // Cleanup function
    return () => {
      if (client) {
        client.subscription.disconnect();
      }
    };
  }, []);

  const createOrder = async () => {
    if (!client) return;

    try {
      const order = await client.trading.createOrder({
        market: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: '0.001',
        price: '50000'
      });
      console.log('Order created successfully:', order);
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  return (
    <div>
      <h1>MYX Trading App</h1>
      {price && <p>BTC/USDT Price: {price}</p>}
      <button onClick={createOrder}>Create Buy Order</button>
      <div>
        <h3>Order List</h3>
        {orders.map((order, index) => (
          <div key={index}>
            Order ID: {order.id}, Status: {order.status}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TradingApp;
```

### Node.js Server Example

```javascript
import { MyxClient } from '@myx-trade/sdk';
import { ethers } from 'ethers';

async function startTradingBot() {
  // Create signer using private key
  const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID');
  const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

  const client = new MyxClient({
    chainId: 1,
    signer: signer,
    brokerAddress: '0x...',
    isTestnet: false,
    logLevel: 'info'
  });

  // Connect WebSocket
  await client.subscription.connect();

  // Listen to price changes
  client.subscription.subscribeTickers(1, (data) => {
    const currentPrice = parseFloat(data.data.p);
    console.log(`BTC/USDT current price: ${currentPrice}`);
    
    // Simple trading strategy example
    if (currentPrice < 45000) {
      // Buy when price is below 45000
      client.trading.createOrder({
        market: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: '0.001',
        price: (currentPrice * 0.99).toString()
      }).then(order => {
        console.log('Buy order created successfully:', order.id);
      }).catch(error => {
        console.error('Buy order creation failed:', error);
      });
    }
  });

  // Listen to order status
  await client.subscription.auth();
  client.subscription.subscribeOrder((data) => {
    console.log('Order status update:', data);
  });
}

startTradingBot().catch(console.error);
```

## Error Handling

```javascript
try {
  const client = new MyxClient(config);
  await client.subscription.connect();
} catch (error) {
  switch (error.code) {
    case 'INVALID_SIGNER':
      console.error('Invalid signer');
      break;
    case 'INVALID_CHAIN_ID':
      console.error('Invalid chain ID');
      break;
    case 'WEBSOCKET_CONNECTION_FAILED':
      console.error('WebSocket connection failed');
      break;
    case 'INVALID_ACCESS_TOKEN':
      console.error('Invalid access token');
      break;
    default:
      console.error('Unknown error:', error.message);
  }
}
```

## Best Practices

1. **Connection Management**: 
   - Establish WebSocket connection when app starts
   - Disconnect when app closes
   - Monitor connection status changes

2. **Error Handling**:
   - Always use try-catch for async operations
   - Listen to WebSocket error events
   - Implement appropriate retry mechanisms

3. **Memory Management**:
   - Cancel unnecessary subscriptions promptly
   - Clean up event listeners
   - Avoid memory leaks

4. **Performance Optimization**:
   - Set appropriate polling intervals
   - Use appropriate log levels
   - Avoid excessive data subscriptions

5. **Security**:
   - Keep private keys secure
   - Use HTTPS/WSS connections
   - Validate data integrity

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check network connection
   - Verify firewall settings
   - Validate WebSocket URL

2. **Authentication Failed**
   - Check if access token is valid
   - Verify signer configuration is correct
   - Validate broker address

3. **Order Creation Failed**
   - Check account balance
   - Validate order parameters
   - Confirm market status

### Debug Mode

Enable debug mode to get detailed logs:

```javascript
const client = new MyxClient({
  // ... other configurations
  logLevel: 'debug'
});
```


---

**Note**: This SDK is still under active development, and the API may change. Please check the changelog regularly.
