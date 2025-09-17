# MyxClient 使用说明

## 概述

`MyxClient` 是一个基于 Mixin 模式的客户端，实现了类似多继承的效果，让你可以直接调用各个模块的方法，就像这些方法原本就属于 MyxClient 一样。

## 特性

- **Mixin 多继承**：使用 Mixin 模式实现多继承效果，所有模块方法直接成为 MyxClient 的方法
- **模块化设计**：每个功能模块都是独立的类
- **多种调用方式**：支持直接调用和通过模块属性调用
- **类型安全**：完整的 TypeScript 支持，包括 Mixin 方法的类型推断
- **向后兼容**：保持原有 API 的兼容性
- **代码简洁**：无需手动转发方法，代码更加简洁

## 使用方式

### 1. 直接调用（推荐）

```typescript
const client = new MyxClient(config);

// 直接调用各个模块的方法
await client.getSymbols();           // Markets 模块
await client.placeOrder(...);        // Trading 模块  
await client.addLiquidity(...);      // LP 模块
```

### 2. 通过模块属性调用

```typescript
const client = new MyxClient(config);

// 通过模块属性调用
await client.markets.getSymbols();
await client.trading.placeOrder(...);
await client.lp.addLiquidity(...);
```

### 3. 向后兼容方式

```typescript
const client = new MyxClient(config);

// 保持原有 API
await client.getPairList();
```

## 模块说明

### Markets 模块
- `getSymbols()` - 获取交易对列表

### Trading 模块  
- `placeOrder(symbol, side, amount)` - 下单
- `cancelOrder(orderId)` - 取消订单
- `getOrderHistory()` - 获取订单历史

### LP 模块
- `addLiquidity(poolId, amount)` - 添加流动性
- `removeLiquidity(poolId, amount)` - 移除流动性
- `getLiquidityPositions()` - 获取流动性仓位

## 添加新模块

1. 创建新的模块类，继承 `MyxBase`
2. 在 Mixin 接口中添加新模块类型
3. 在构造函数中初始化新模块
4. 在 `applyMixins` 调用中添加新模块

```typescript
// 1. 创建模块类
export class MyxNewModule extends MyxBase {
  newMethod() {
    return Promise.resolve('result');
  }
}

// 2. 更新 Mixin 接口
interface MyxClient extends MyxMarkets, MyxTrading, MyxLP, MyxNewModule {}

// 3. 在构造函数中初始化
constructor (options: MyxClientConfig) {
  super();
  this.setConfig(options);
  
  this.markets = new MyxMarkets();
  this.trading = new MyxTrading();
  this.lp = new MyxLP();
  this.newModule = new MyxNewModule();  // 初始化新模块
}

// 4. 在 applyMixins 中添加新模块
applyMixins(MyxClient, [MyxMarkets, MyxTrading, MyxLP, MyxNewModule]);
```

## 技术实现

- 使用 **Mixin 模式**实现多继承效果
- 使用 `applyMixins` 函数将模块方法复制到主客户端原型
- 使用 TypeScript 接口合并提供完整的类型支持
- 保持正确的 `this` 上下文绑定
- 代码更简洁，无需手动转发方法

## Mixin 模式的优势

1. **真正的多继承效果**：所有模块方法直接成为 MyxClient 的方法
2. **类型安全**：TypeScript 能正确推断所有 Mixin 方法的类型
3. **代码简洁**：无需手动转发或代理方法
4. **性能更好**：直接方法调用，无代理开销
5. **易于维护**：添加新模块只需几行代码
