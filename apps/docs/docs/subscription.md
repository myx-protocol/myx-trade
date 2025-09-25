---
sidebar_position: 2
---

# Subscription Module

The Subscription module provides WebSocket connection functionality with the MYX trading platform for subscribing to real-time market data, user orders, and position information.

## Overview

The Subscription module is based on WebSocket connections and supports:
- Real-time price data subscription
- K-line data subscription
- User order status updates
- Position information updates
- Auto-reconnection and authentication

## Initialization

```javascript
import { MyxClient } from '@myx-trade/sdk';

const client = new MyxClient({
  chainId: 1,
  signer: signer,
  brokerAddress: '0x...',
  // Optional: WebSocket configuration
  socketConfig: {
    initialReconnectDelay: 1000,
    maxReconnectDelay: 30000,
    maxReconnectAttempts: 10,
    requestTimeout: 5000
  }
});

// Get subscription instance
const subscription = client.subscription;
```

## Connection Management

### Connect WebSocket

```javascript
// Connect to WebSocket
subscription.connect();

// Check connection status
if (subscription.isConnected) {
  console.log('WebSocket connected');
}
```

### Disconnect

```javascript
// Disconnect WebSocket connection
subscription.disconnect();
```

### Reconnect

```javascript
// Manually reconnect
subscription.reconnect();
```

## Public Data Subscription

### Price Data Subscription

Subscribe to real-time price data for specified trading pairs:

```javascript
// Subscribe to BTC/USDT price data (globalId: 1)
subscription.subscribeTickers(1, (data) => {
  console.log('Price data:', {
    symbol: 'BTC/USDT',
    price: data.data.p,      // Latest price
    change: data.data.C,     // Price change
    volume: data.data.v,     // Trading volume
    high: data.data.h,       // Highest price
    low: data.data.l,        // Lowest price
    timestamp: data.data.E   // Timestamp
  });
});

// Unsubscribe
subscription.unsubscribeTickers(1, callback);
```

### K-line Data Subscription

Subscribe to K-line data for specified trading pairs and periods:

```javascript
// Subscribe to BTC/USDT 1-minute K-line data
subscription.subscribeKline(1, '1m', (data) => {
  console.log('K-line data:', {
    symbol: 'BTC/USDT',
    timeframe: data.resolution,
    open: data.data.o,       // Open price
    high: data.data.h,       // High price
    low: data.data.l,        // Low price
    close: data.data.c,      // Close price
    volume: data.data.v,     // Volume
    timestamp: data.data.t   // Timestamp
  });
});

// Unsubscribe
subscription.unsubscribeKline(1, '1m', callback);
```

#### Supported K-line Periods

- `1m` - 1 minute
- `5m` - 5 minutes
- `15m` - 15 minutes
- `30m` - 30 minutes
- `1h` - 1 hour
- `4h` - 4 hours
- `1d` - 1 day
- `1w` - 1 week
- `1M` - 1 month

## Private Data Subscription

### Authentication

Before subscribing to private data (orders, positions), authentication is required:

```javascript
// Manual authentication
await subscription.auth();
```

### Order Data Subscription

Subscribe to user order status updates:

```javascript
// Subscribe to order data
await subscription.subscribeOrder((data) => {
  console.log('Order update:', data);
  // Handle order status changes
});

// Unsubscribe
subscription.unsubscribeOrder(callback);
```

### Position Data Subscription

Subscribe to user position information updates:

```javascript
// Subscribe to position data
await subscription.subscribePosition((data) => {
  console.log('Position update:', data);
  // Handle position changes
});

// Unsubscribe
subscription.unsubscribePosition(callback);
```

## Event Listening

The Subscription module supports listening to WebSocket connection events:

```javascript
// Listen to connection open event
subscription.on('open', (event) => {
  console.log('WebSocket connection established');
});

// Listen to connection close event
subscription.on('close', (event) => {
  console.log('WebSocket connection closed');
});

// Listen to error event
subscription.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Listen to reconnection event
subscription.on('reconnecting', (data) => {
  console.log(`Reconnecting, attempt count: ${data.detail}`);
});

// Remove event listener
subscription.off('open', handler);
```

## Configuration Options

### WebSocket Configuration

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

## Complete Example

```javascript
import { MyxClient } from '@myx-trade/sdk';
import { ethers } from 'ethers';

async function setupSubscription() {
  // Initialize client
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const client = new MyxClient({
    chainId: 1,
    signer: signer,
    brokerAddress: '0x...',
    socketConfig: {
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      maxReconnectAttempts: 10
    }
  });

  const subscription = client.subscription;

  // Listen to connection events
  subscription.on('open', () => {
    console.log('WebSocket connection successful');
    
    // Subscribe to price data
    subscription.subscribeTickers(1, (data) => {
      console.log('BTC/USDT price:', data.data.p);
    });
    
    // Subscribe to K-line data
    subscription.subscribeKline(1, '1m', (data) => {
      console.log('K-line data:', data.data);
    });
    
    // Authenticate and subscribe to private data
    subscription.auth().then(() => {
      subscription.subscribeOrder((data) => {
        console.log('Order update:', data);
      });
      
      subscription.subscribePosition((data) => {
        console.log('Position update:', data);
      });
    });
  });

  subscription.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  subscription.on('reconnecting', (data) => {
    console.log(`Reconnecting... attempt count: ${data.detail}`);
  });

  // Connect to WebSocket
  subscription.connect();
}

setupSubscription();
```

## Error Handling

```javascript
try {
  await subscription.auth();
  await subscription.subscribeOrder(callback);
} catch (error) {
  if (error.code === 'INVALID_ACCESS_TOKEN') {
    console.error('Invalid access token');
  } else if (error.code === 'WEBSOCKET_CONNECTION_FAILED') {
    console.error('WebSocket connection failed');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Best Practices

1. **Connection Management**: Establish connections when the app starts, disconnect when the app closes
2. **Error Handling**: Always listen to error events and handle them appropriately
3. **Reconnection Strategy**: Utilize built-in auto-reconnection features, but also listen to reconnection events
4. **Memory Management**: Cancel unnecessary subscriptions promptly to avoid memory leaks
5. **Authentication**: Ensure authentication is completed before subscribing to private data

## Important Notes

- WebSocket connections require a stable network environment
- Private data subscriptions require valid access tokens
- The amount of subscribed data affects network bandwidth and performance
- It's recommended to configure appropriate reconnection and timeout parameters in production environments
