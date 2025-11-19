# MYX Trade SDK Integration Guide - Diff (EN/中文)

## EN: Key Differences vs original

- Structure reorganized by modules: Initialization & Config, Orders, Positions, Orders Data, Markets, Utils, LP Manage, Subscriptions, Types Reference.
- Replaced deprecated `myxClient.trading.*` with `myxClient.order.*`, `myxClient.position.*`, `myxClient.utils.*`, `myxClient.markets.*`.
- Orders: switched to `price` field (30 decimals). Added `createPositionTpSlOrder`, `updateOrderTpSl`, cancellation, approval via utils, and `getNetworkFee` mention.
- Positions: added `adjustCollateral` flow using `updatePriceAndAdjustCollateral`.
- Markets: both top-level and client methods documented.
- Subscriptions: added `connect/disconnect/reconnect/isConnected`, `auth`, public topics `subscribeTickers/subscribeKline`, private `subscribeOrder/subscribePosition`, and `on/off` events.
- Types Reference: included `PlaceOrderParams`, `PositionTpSlOrderParams`, `UpdateOrderParams`, enums, and websocket types with field notes.

## 中文：主要差异点

- 文档按模块重组：初始化与配置、订单、仓位、订单数据、市场、工具、LP 管理、订阅、类型参考。
- 用 `myxClient.order.* / position.* / utils.* / markets.*` 替代旧 `trading.*`。
- 订单：统一使用 `price`（30 位小数）；新增 `createPositionTpSlOrder`、`updateOrderTpSl`、撤单、通过 utils 授权与 `getNetworkFee`。
- 仓位：新增 `adjustCollateral`（链上 `updatePriceAndAdjustCollateral`）。
- 市场：同时涵盖顶层与 client 两种方式。
- 订阅：新增连接/鉴权/公共与私有主题/事件监听的完整示例。
- 类型参考：补充了 `PlaceOrderParams`、`PositionTpSlOrderParams`、`UpdateOrderParams`、枚举与 websocket 类型。

## Notes/说明

- 原文中的示例结构基本保留，但以当前源码为准对 API 名称与参数做了同步。
- 若你仍需保留旧接口示例，可将新版与旧版并行展示，但建议迁移到 `order/position/utils/markets`。

### Subscription (WebSocket)

- EN: Added section with `subscription.connect/disconnect/reconnect/isConnected`, public topics `subscribeTickers/unsubscribeTickers`, `subscribeKline/unsubscribeKline`, private topics `auth`, `subscribeOrder/unsubscribeOrder`, `subscribePosition/unsubscribePosition`, and event listeners `on/off`.
- 中文：新增订阅章节，包含 `subscription.connect/disconnect/reconnect/isConnected`，公共主题 `subscribeTickers/unsubscribeTickers`、`subscribeKline/unsubscribeKline`，私有主题 `auth`、`subscribeOrder/unsubscribeOrder`、`subscribePosition/unsubscribePosition`，以及事件监听 `on/off`。
