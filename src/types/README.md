# MYX Trade SDK Types

This directory contains all TypeScript type definitions for the MYX Trade SDK.

## Structure

### 📁 Files Overview

- **`index.ts`** - Main entry point, exports all types
- **`trading.ts`** - Trading and order related types
- **`order.ts`** - Order management types
- **`pool.ts`** - Pool and liquidity related types
- **`api.ts`** - API response and WebSocket types
- **`error.ts`** - Error handling and error codes
- **`common.ts`** - Common utility types
- **`chain.ts`** - Chain and network related types

## Usage

### Import All Types

```typescript
import { 
  OrderType, 
  Direction, 
  PlaceOrderParams, 
  Pool, 
  ErrorCode 
} from '@myx-trade/sdk';
```

### Import Specific Categories

```typescript
// Trading types only
import { 
  OrderType, 
  Direction, 
  TriggerType, 
  PlaceOrderParams 
} from '@myx-trade/sdk/types/trading';

// Error types only
import { 
  SDKError, 
  NetworkError, 
  ErrorCode 
} from '@myx-trade/sdk/types/error';
```

## Type Categories

### 🔄 Trading Types

Core trading functionality types:

```typescript
// Order types
OrderType.MARKET    // 市价单
OrderType.LIMIT     // 限价单
OrderType.STOP      // 止损单

// Direction
Direction.LONG      // 做多
Direction.SHORT     // 做空

// Operation
OperationType.INCREASE  // 增加仓位
OperationType.DECREASE  // 减少仓位
```

### 📊 Pool Types

Pool and market data types:

```typescript
interface Pool {
  poolId: string;
  baseSymbol: string;
  quoteSymbol: string;
  maxLeverage: number;
  state: PoolState;
}

interface PoolLevel {
  level: number;
  levelName: string;
  levelConfig: PoolLevelConfig;
}
```

### 🌐 API Types

API and WebSocket communication types:

```typescript
interface BaseApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

interface WSMessage<T> {
  type: WSMessageType;
  channel?: string;
  data: T;
  timestamp: number;
}
```

### ⚠️ Error Types

Comprehensive error handling:

```typescript
class SDKError extends Error {
  code: ErrorCode;
  details?: any;
  timestamp: number;
}

// Specific error types
class NetworkError extends SDKError
class ValidationError extends SDKError
class TradingError extends SDKError
class ContractError extends SDKError
```

### 🔗 Chain Types

Multi-chain support types:

```typescript
interface ChainConfig {
  id: ChainId;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
```

### 🛠️ Common Types

Utility and helper types:

```typescript
type Address = `0x${string}`;
type TransactionHash = `0x${string}`;
type BigNumberString = string;

interface TransactionResult {
  hash: TransactionHash;
  chainId: ChainId;
  gasUsed?: BigNumberString;
}
```

## Type Safety Best Practices

### 1. Use Branded Types

```typescript
type OrderId = Brand<string, 'OrderId'>;
type PositionId = Brand<string, 'PositionId'>;

// Prevents mixing up different ID types
function getOrder(orderId: OrderId) { /* ... */ }
function getPosition(positionId: PositionId) { /* ... */ }
```

### 2. Leverage Union Types

```typescript
type OrderStatus = 'pending' | 'filled' | 'cancelled';
type NetworkStatus = 'connected' | 'disconnected' | 'error';
```

### 3. Use Type Guards

```typescript
function isSDKError(error: unknown): error is SDKError {
  return error instanceof SDKError;
}

function isTradingError(error: SDKError): error is TradingError {
  return error.name === 'TradingError';
}
```

### 4. Generic Type Constraints

```typescript
interface ApiResponse<T extends Record<string, any>> {
  data: T;
  success: boolean;
}
```

## Enums vs Const Assertions

We use const assertions instead of enums for better tree-shaking and type safety:

```typescript
// ✅ Recommended (const assertion)
export const OrderType = {
  MARKET: 0,
  LIMIT: 1,
  STOP: 2
} as const;
export type OrderType = typeof OrderType[keyof typeof OrderType];

// ❌ Avoid (enum)
export enum OrderType {
  MARKET = 0,
  LIMIT = 1,
  STOP = 2
}
```

## Adding New Types

### 1. Create Type Definition

```typescript
// In appropriate file (e.g., trading.ts)
export interface NewTradingFeature {
  id: string;
  type: 'feature_type';
  params: Record<string, any>;
}
```

### 2. Export from Index

```typescript
// In types/index.ts
export * from './trading'; // Already exports NewTradingFeature
```

### 3. Update Documentation

Add examples and usage information to this README.

### 4. Add Tests

```typescript
// In __tests__/types.test.ts
describe('NewTradingFeature', () => {
  it('should have correct type structure', () => {
    const feature: NewTradingFeature = {
      id: 'test',
      type: 'feature_type',
      params: {}
    };
    expect(typeof feature.id).toBe('string');
  });
});
```

## Type Evolution

### Breaking Changes

- Major version bump required
- Migration guide provided
- Deprecated types marked with `@deprecated`

### Non-Breaking Changes

- Minor version bump
- Backward compatible
- New optional properties
- Additional union members

### Deprecation Process

```typescript
/**
 * @deprecated Use NewInterface instead. Will be removed in v2.0.0
 */
export interface OldInterface {
  // ...
}
```

## IDE Support

### VS Code

Install the TypeScript extension and configure:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true
}
```

### IntelliSense

The SDK provides full IntelliSense support with:
- Auto-completion for all types
- Inline documentation
- Error detection
- Quick fixes

## Contributing

When contributing new types:

1. Follow existing naming conventions
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Update this documentation
5. Add appropriate tests
6. Consider backward compatibility

## Version History

- **v1.0.0** - Initial type system
- **v1.1.0** - Added error handling types
- **v1.2.0** - Enhanced pool and trading types
- **v1.3.0** - Added multi-chain support types
