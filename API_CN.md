# MYX 智能合约 API 文档

MYX V2 协议的源代码可在 [GitHub](https://github.com/myx-protocol/myx-contract-v2) 上获取。核心合约分为以下几个类别：

- Broker - 经纪人系统
- Router - 路由系统
- Oracle - 预言机系统
- Trading - 交易系统
- Pool - 流动性池系统
- Manager - 管理系统

---

## Broker（经纪人系统）

经纪人系统负责管理费率配置、返佣分配以及经纪人的生命周期。**交易订单的下达和取消通过 TradingRouter 合约执行**（见 Router 系统章节）。

### BrokerManager

`BrokerManager` 是经纪人系统的注册表和生命周期管理合约。

**核心方法：**

#### createBroker

```solidity
function createBroker(
    address owner,
    string calldata name,
    address[] calldata signers
) external returns (address broker)
```

无权限创建并注册一个新的经纪人合约。

该函数**任何人都可以调用**（permissionless），使用 BrokerManager 预设的默认资产类别和基础费率配置，通过信标代理模式部署新的经纪人实例，并自动将其注册并激活到系统中。

**输入参数：**

| 名称    | 类型      | 描述                                   |
| ------- | --------- | -------------------------------------- |
| owner   | address   | 经纪人合约的所有者地址                 |
| name    | string    | 经纪人的可读名称                       |
| signers | address[] | 授权签名者地址数组，可为空             |

**返回值：**

| 类型    | 描述                   |
| ------- | ---------------------- |
| address | 新创建的经纪人合约地址 |

#### getDefaultConfig

```solidity
function getDefaultConfig() external view returns (
    AssetClass[] memory assetClasses,
    IBroker.FeeRate[] memory baseFeeRates
)
```

获取当前的默认配置（资产类别和基础费率）。

#### brokerList

```solidity
function brokerList() external view returns (address[] memory)
```

获取所有已注册经纪人的地址列表。

#### isBroker / isActiveBroker

```solidity
function isBroker(address broker) external view returns (bool)
function isActiveBroker(address broker) external view returns (bool)
```

检查地址是否为注册/活跃的经纪人。

---

### Broker

`Broker` 是管理费率配置、返佣分配和用户费用数据的核心经纪人合约。支持多资产类别、多风险等级的分层费率体系和 EIP-712 签名验证。

**主要功能：**

- 费用等级配置（基础费率 + 附加费率分层体系）
- 用户费用数据管理（EIP-712 签名方式 / 签名者直接方式）
- 返佣分配（推荐人返佣机制）
- 经纪人费用提取

**费率体系：**

```
最终费率 = baseFeeRate[assetClass] + addOnFeeTier[assetClass][riskTier][userTier]
```

- `baseFeeRate`：由 BrokerManager 按 assetClass 统一配置
- `addOnFeeTier`：由 Broker Owner 按 `[assetClass][riskTier][feeTier]` 精细配置
- `userTier`：通过 `setUserFeeData` / `updateUserFeeData` 为用户分配

**核心方法：**

#### setUserFeeData

```solidity
function setUserFeeData(SetUserFeeDataParams calldata params) external
```

任何人（permissionless）均可调用，通过提交 EIP-712 签名为指定用户设置费率等级和推荐返佣配置。这是**链下签名 + 链上验证**的标准流程。

**验证逻辑（按顺序）：**
1. `params.feeDataEpoch == currentFeeDataEpoch`（epoch 必须匹配当前纪元）
2. ECDSA 签名恢复，签名者必须在授权签名者集合中
3. `block.timestamp <= params.deadline`（签名未过期）
4. `params.nonce == userNonces[user] + 1`（严格递增，防重放）
5. `referrer != user`（不能自引用）
6. `referrerRebatePct <= totalReferralRebatePct <= 1e8`（返佣比例合法）

**输入参数：**

| 名称                                | 类型                 | 描述                                                                |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------- |
| params.user                         | address              | 目标用户地址                                                        |
| params.nonce                        | uint64               | 签名 nonce，必须等于 `userNonces[user] + 1`                         |
| params.deadline                     | uint64               | 签名过期的 Unix 时间戳                                              |
| params.feeDataEpoch                 | uint64               | 费率数据纪元，必须等于当前 `currentFeeDataEpoch`                    |
| params.feeData.tier                 | uint8                | 用户的费率等级（0 = 默认，需 broker 配置对应 addOn）                |
| params.feeData.referrer             | address              | 推荐人地址，不能是用户自己（零地址表示无推荐人）                    |
| params.feeData.totalReferralRebatePct | uint32             | 总返佣比例（精度 1e8，即 `100_000_000` = 100%）                     |
| params.feeData.referrerRebatePct    | uint32               | 推荐人分得的返佣比例（精度 1e8，必须 ≤ totalReferralRebatePct）     |
| params.signature                    | bytes                | 授权签名者对上述数据的 EIP-712 签名                                 |

**EIP-712 签名规范：**

```
Domain: {
    name: "Broker",
    version: "1.0",
    chainId: <当前链 ID>,
    verifyingContract: <Broker 合约地址>
}

TypeHash:
    UserFeeData(address user,uint64 nonce,uint64 deadline,uint64 epoch,
                uint8 tier,address referrer,uint32 totalReferralRebatePct,
                uint32 referrerRebatePct)

FEE_TYPEHASH = 0xedae78af6c953013196c57c14a83e4da539144d1d371a1ab7c4f893d55a2c798

StructHash = keccak256(abi.encode(
    FEE_TYPEHASH,
    params.user,
    params.nonce,
    params.deadline,
    params.feeDataEpoch,        // 注意：epoch 在 tier 之前
    params.feeData.tier,
    params.feeData.referrer,
    params.feeData.totalReferralRebatePct,
    params.feeData.referrerRebatePct
))
```

**ethers.js v6 签名示例：**

```typescript
const domain = {
    name: "Broker",
    version: "1.0",
    chainId: chainId,
    verifyingContract: brokerAddress,
};
const types = {
    UserFeeData: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint64" },
        { name: "deadline", type: "uint64" },
        { name: "epoch", type: "uint64" },
        { name: "tier", type: "uint8" },
        { name: "referrer", type: "address" },
        { name: "totalReferralRebatePct", type: "uint32" },
        { name: "referrerRebatePct", type: "uint32" },
    ],
};
const value = {
    user: userAddress,
    nonce: currentNonce + 1n,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    epoch: currentFeeDataEpoch,
    tier: 1,
    referrer: referrerAddress,
    totalReferralRebatePct: 20_000_000n,
    referrerRebatePct: 10_000_000n,
};
const signature = await authorizedSigner.signTypedData(domain, types, value);
```

#### updateUserFeeData

```solidity
function updateUserFeeData(address user, UserFeeData calldata feeData) external
```

由授权签名者（`onlySigner`）直接链上设置用户费率数据，无需 EIP-712 签名。适用于后端批量管理场景。

与 `setUserFeeData` 的区别：无 nonce 检查，无 deadline，签名者直接调用。

**输入参数：**

| 名称    | 类型        | 描述                   |
| ------- | ----------- | ---------------------- |
| user    | address     | 目标用户地址           |
| feeData | UserFeeData | 费率数据结构体         |

#### resetAllUserFeeData

```solidity
function resetAllUserFeeData() external
```

递增 `currentFeeDataEpoch`，使所有用户的历史费率数据失效，所有用户自动回到默认状态。只有授权签名者（`onlySigner`）可调用。

#### setSigner

```solidity
function setSigner(address signer, bool isSigner) external
```

设置或撤销授权签名者。只有合约所有者（Broker Owner）可调用。

**输入参数：**

| 名称     | 类型    | 描述                         |
| -------- | ------- | ---------------------------- |
| signer   | address | 签名者地址                   |
| isSigner | bool    | true = 添加授权，false = 撤销 |

#### syncAssetClass

```solidity
function syncAssetClass(AssetClass assetClass) external
```

从 BrokerManager 同步指定资产类别的默认基础费率到当前 Broker。只有合约所有者可调用。

#### updateFeeTier

```solidity
function updateFeeTier(
    AssetClass assetClass,
    uint8 riskTier,
    uint8 feeTier,
    FeeRate memory feeRate
) external
```

更新单个附加费率等级配置。只有合约所有者可调用。

**输入参数：**

| 名称       | 类型       | 描述                                   |
| ---------- | ---------- | -------------------------------------- |
| assetClass | AssetClass | 资产类别                               |
| riskTier   | uint8      | 风险等级                               |
| feeTier    | uint8      | 费率等级编号（0-9，需 > 0 方可激活）   |
| feeRate    | FeeRate    | 附加费率（takerFeeRate + makerFeeRate）|

#### batchUpdateFeeTiers

```solidity
function batchUpdateFeeTiers(IBroker.UpdateAddOnFeeTierParams[] calldata params) external
```

批量更新多个附加费率等级。只有合约所有者可调用。

**UpdateAddOnFeeTierParams 结构体字段：**

| 字段名称    | 类型       | 描述             |
| ----------- | ---------- | ---------------- |
| assetClass  | AssetClass | 资产类别         |
| riskTier    | uint8      | 风险等级         |
| feeTier     | uint8      | 费率等级编号     |
| addOnFeeRate| FeeRate    | 附加费率         |

#### withdrawBrokerFees

```solidity
function withdrawBrokerFees(address token, uint256 amount, address recipient) external
```

提取经纪人累积的协议费用。只有合约所有者可调用。

**输入参数：**

| 名称      | 类型    | 描述               |
| --------- | ------- | ------------------ |
| token     | address | 要提取的代币地址   |
| amount    | uint256 | 提取数量           |
| recipient | address | 接收地址           |

#### claimRebate / claimRebates

```solidity
function claimRebate(address token) external
function claimRebates(address[] calldata tokens) external
```

领取累积的返佣奖励。返佣来源于 `onBrokerFee` 按用户费率配置分配的推荐返佣。

**输入参数：**

| 名称   | 类型      | 描述                         |
| ------ | --------- | ---------------------------- |
| token  | address   | 要领取返佣的代币地址         |
| tokens | address[] | 要批量领取返佣的代币地址数组 |

#### onBrokerFee

```solidity
function onBrokerFee(
    PoolId poolId,
    address user,
    address token,
    uint256 feeAmount
) external returns (
    uint256 totalReferralRebate,
    uint256 referrerRebate,
    address referrer
)
```

经纪人费用回调，由 TradingVault 在交易结算时调用。根据用户的费率配置分配返佣：

```
totalReferralRebate = feeAmount × totalReferralRebatePct / 1e8
referrerRebate      = feeAmount × referrerRebatePct / 1e8
userRebate          = totalReferralRebate - referrerRebate
brokerRevenue       = feeAmount - totalReferralRebate
```

**返回值：**

| 名称                | 类型    | 描述                                   |
| ------------------- | ------- | -------------------------------------- |
| totalReferralRebate | uint256 | 分配给用户和推荐人的总返佣金额         |
| referrerRebate      | uint256 | 分配给推荐人的返佣金额                 |
| referrer            | address | 推荐人地址，无推荐关系则为零地址       |

#### getUserFeeRate

```solidity
function getUserFeeRate(
    address user,
    AssetClass assetClass,
    uint8 riskTier
) external view returns (
    uint32 takerFeeRate,
    int32 makerFeeRate,
    uint32 baseTakerFeeRate,
    uint32 baseMakerFeeRate
)
```

查询用户在指定资产类别和风险等级下的完整费率。费率精度为 1e8（100_000_000 = 100%）。

**输入参数：**

| 名称       | 类型       | 描述                              |
| ---------- | ---------- | --------------------------------- |
| user       | address    | 要查询的用户地址                  |
| assetClass | AssetClass | 资产类别（如 SPOT、PERPETUAL 等） |
| riskTier   | uint8      | 风险等级                          |

**返回值：**

| 名称             | 类型   | 描述                                                    |
| ---------------- | ------ | ------------------------------------------------------- |
| takerFeeRate     | uint32 | 最终吃单费率（baseFee + addOnFee，精度 1e8）            |
| makerFeeRate     | int32  | 最终挂单费率（精度 1e8，可为负值表示做市返佣）          |
| baseTakerFeeRate | uint32 | 基础吃单费率（精度 1e8）                                |
| baseMakerFeeRate | uint32 | 基础挂单费率（精度 1e8）                                |

#### getBaseFeeRate

```solidity
function getBaseFeeRate(AssetClass assetClass) external view returns (FeeRate memory baseFeeRate)
```

获取指定资产类别的基础费率。

#### getAddOnFeeTier

```solidity
function getAddOnFeeTier(
    AssetClass assetClass,
    uint8 riskTier,
    uint8 feeTier
) external view returns (uint32 takerFeeRate, uint32 makerFeeRate)
```

获取指定资产类别、风险等级、费率等级的附加费率。

#### activeFeeTiers

```solidity
function activeFeeTiers(AssetClass assetClass, uint8 riskTier) external view returns (uint256[] memory)
```

获取指定资产类别和风险等级下所有已激活的费率等级编号。

#### supportedAssetClasses

```solidity
function supportedAssetClasses() external view returns (uint256[] memory)
```

获取该经纪人支持的所有资产类别。

#### domainSeparatorV4

```solidity
function domainSeparatorV4() external view returns (bytes32)
```

获取 EIP-712 domain separator，用于链下构建签名。

---

### MYXBroker

`MYXBroker` 继承自 `Broker`，为特殊用户提供**负挂单费率**支持，允许他们通过提供流动性获得做市返佣。

**额外功能：**

- 支持负挂单费率（`makerFeeRate` 可为负值）
- 特殊费率等级（Special Fee Tier）独立于普通 Add-on 费率体系

**核心方法：**

#### setUserSpecialFeeTier

```solidity
function setUserSpecialFeeTier(address user, uint8 feeTier) external
```

为用户分配特殊费率等级（0 = 无特殊等级，恢复普通费率）。只有合约所有者可调用。

**输入参数：**

| 名称    | 类型    | 描述                               |
| ------- | ------- | ---------------------------------- |
| user    | address | 用户地址                           |
| feeTier | uint8   | 特殊费率等级（0 = 取消特殊等级）   |

#### setSpecialFeeTier

```solidity
function setSpecialFeeTier(UpdateSpecialFeeTierParams calldata params) external
```

配置单个特殊费率等级。挂单费率可以为负值。只有合约所有者可调用。

**UpdateSpecialFeeTierParams 结构体字段：**

| 字段名称    | 类型       | 描述                          |
| ----------- | ---------- | ----------------------------- |
| assetClass  | AssetClass | 资产类别                      |
| riskTier    | uint8      | 风险等级                      |
| feeTier     | uint8      | 特殊费率等级编号（必须 > 0）  |
| makerFeeRate| int32      | 挂单费率（可为负值，精度 1e8）|
| takerFeeRate| uint32     | 吃单费率（精度 1e8）          |

#### batchSetSpecialFeeTiers

```solidity
function batchSetSpecialFeeTiers(UpdateSpecialFeeTierParams[] calldata params) external
```

批量配置多个特殊费率等级。只有合约所有者可调用。

#### getUserFeeRate

```solidity
function getUserFeeRate(
    address user,
    AssetClass assetClass,
    uint8 riskTier
) external view returns (uint32 takerFeeRate, int32 makerFeeRate, uint32 baseTakerFeeRate, uint32 baseMakerFeeRate)
```

覆盖父类实现：若用户有特殊等级且该等级在指定 assetClass+riskTier 下已激活，返回特殊费率（`baseTakerFeeRate` 和 `baseMakerFeeRate` 均为 0）；否则回退到普通费率计算。

#### activeSpecialFeeTierList

```solidity
function activeSpecialFeeTierList(AssetClass assetClass, uint8 riskTier) external view returns (uint256[] memory)
```

获取指定资产类别和风险等级下所有已激活的特殊费率等级编号。

#### getSpecialFeeTier

```solidity
function getSpecialFeeTier(
    AssetClass assetClass,
    uint8 riskTier,
    uint8 feeTier
) external view returns (int32 makerFeeRate, uint32 takerFeeRate)
```

获取指定特殊费率等级的费率配置。

---

## Router（路由系统）

路由系统提供两个主要入口：`TradingRouter` 处理交易订单和仓位操作；`LiquidityRouter` 处理流动性池存取款和 TPSL 订单。

### TradingRouter

`TradingRouter` 是交易者与协议交互的主要入口合约，负责订单下达、取消、更新以及仓位保证金调整。支持 ERC2771 元交易（通过 Forwarder）。

**核心方法：**

#### depositToAccount

```solidity
function depositToAccount(address recipient, address token, uint256 amount) external
```

将代币存入指定账户的协议内余额。

**输入参数：**

| 名称      | 类型    | 描述                       |
| --------- | ------- | -------------------------- |
| recipient | address | 接收账户余额的地址         |
| token     | address | 存入的代币地址             |
| amount    | uint256 | 存入数量（代币精度）       |

#### placeOrderWithSalt / placeOrderWithPosition

```solidity
function placeOrderWithSalt(
    uint64 userPositionSalt,
    OrderTypes.DepositParams calldata depositParams,
    OrderTypes.PlaceOrderParams calldata orderParams
) external payable

function placeOrderWithPosition(
    PositionId positionId,
    OrderTypes.DepositParams calldata depositParams,
    OrderTypes.PlaceOrderParams calldata orderParams
) external payable
```

为新仓位（使用 salt）或现有仓位创建并提交交易订单。

- `placeOrderWithSalt`：新建仓位，通过 `PositionKey(poolId, user, direction, salt)` 推导仓位 ID
- `placeOrderWithPosition`：现有仓位，直接引用仓位 ID

**调用要求：**
- 经纪人处于活跃状态
- 调用者必须是订单所有者（`orderParams.user == msg.sender`）

**输入参数：**

| 名称              | 类型                        | 描述                                                           |
| ----------------- | --------------------------- | -------------------------------------------------------------- |
| userPositionSalt  | uint64                      | （placeOrderWithSalt）用于推导仓位 ID 的唯一 salt 值            |
| positionId        | PositionId                  | （placeOrderWithPosition）现有仓位的仓位 ID                    |
| depositParams     | OrderTypes.DepositParams    | 可选充值参数（token + amount），充值到账户后用作保证金          |
| orderParams       | OrderTypes.PlaceOrderParams | 订单参数结构体                                                  |

**PlaceOrderParams 结构体字段：**

| 字段名称          | 类型        | 描述                                                                          |
| ----------------- | ----------- | ----------------------------------------------------------------------------- |
| user              | address     | 订单所有者地址                                                                |
| poolId            | PoolId      | 目标执行池的 ID                                                               |
| broker            | address     | 经纪人地址（必须是活跃经纪人）                                                |
| orderType         | OrderType   | 订单类型（Market 市价、Limit 限价、Stop 止盈止损、Conditional 条件单）        |
| triggerType       | TriggerType | 触发条件（None 无、GTE 大于等于、LTE 小于等于）                               |
| operation         | Operation   | 操作类型（Increase 增仓、Decrease 减仓）                                      |
| direction         | Direction   | 方向（Long 做多、Short 做空）                                                 |
| collateralAmount  | uint256     | 提供的保证金数量（代币精度）                                                  |
| size              | uint256     | 订单数量（以基础资产计价，代币精度）                                          |
| price             | uint256     | 订单价格（限价单和止盈止损单，精度 1e30）                                     |
| timeInForce       | TimeInForce | 订单有效期（目前仅支持 IOC - 立即成交或取消）                                 |
| postOnly          | bool        | 是否仅挂单（true 时订单只能作为 maker）                                       |
| slippagePct       | uint16      | 最大滑点百分比（精度 1e4，即 10000 = 100%）                                   |
| executionFeeToken | address     | 执行费用代币地址                                                              |
| leverage          | uint16      | 仓位杠杆倍数（10 = 10倍杠杆）                                                 |
| tpSize            | uint256     | 止盈订单数量（代币精度，可选）                                                |
| tpPrice           | uint256     | 止盈触发价格（精度 1e30）                                                     |
| slSize            | uint256     | 止损订单数量（代币精度，可选）                                                |
| slPrice           | uint256     | 止损触发价格（精度 1e30）                                                     |

#### placeOrdersWithSalt / placeOrdersWithPosition

```solidity
function placeOrdersWithSalt(
    OrderTypes.DepositParams calldata depositParams,
    uint64[] calldata userPositionSalts,
    OrderTypes.PlaceOrderParams[] calldata orderParams
) external payable

function placeOrdersWithPosition(
    OrderTypes.DepositParams calldata depositParams,
    PositionId[] calldata positionIds,
    OrderTypes.PlaceOrderParams[] calldata orderParams
) external payable
```

在单个交易中批量下达多个订单。所有订单必须属于调用者。

**输入参数：**

| 名称               | 类型                          | 描述                                      |
| ------------------ | ----------------------------- | ----------------------------------------- |
| depositParams      | OrderTypes.DepositParams      | 可选充值参数（为所有订单共用）            |
| userPositionSalts  | uint64[]                      | （placeOrdersWithSalt）salt 值数组        |
| positionIds        | PositionId[]                  | （placeOrdersWithPosition）仓位 ID 数组   |
| orderParams        | OrderTypes.PlaceOrderParams[] | 订单参数数组，数量必须与 salt/ID 数组相同 |

#### cancelOrder / cancelOrders

```solidity
function cancelOrder(OrderId orderId) external
function cancelOrders(OrderId[] calldata orderIds) external
```

取消单个或多个交易订单。只有订单所有者可以取消。取消后退还保证金，执行费不退还。

**输入参数：**

| 名称     | 类型      | 描述                     |
| -------- | --------- | ------------------------ |
| orderId  | OrderId   | 要取消的订单 ID          |
| orderIds | OrderId[] | 要批量取消的订单 ID 数组 |

#### updateOrder

```solidity
function updateOrder(
    OrderTypes.DepositParams calldata depositParams,
    OrderTypes.UpdateOrderParams calldata params
) external
```

更新现有订单的参数（价格、数量、止盈止损设置）。只有订单所有者可以更新。

**UpdateOrderParams 结构体字段：**

| 字段名称 | 类型                  | 描述             |
| -------- | --------------------- | ---------------- |
| orderId  | OrderId               | 要更新的订单 ID  |
| broker   | address               | 经纪人地址       |
| size     | uint256               | 新的订单数量     |
| price    | uint256               | 新的订单价格     |
| tpsl     | UpdateOrderTPSLParams | 止盈止损参数更新 |

**UpdateOrderTPSLParams 结构体字段：**

| 字段名称           | 类型    | 描述                           |
| ------------------ | ------- | ------------------------------ |
| tpSize             | uint256 | 新的止盈订单数量               |
| tpPrice            | uint256 | 新的止盈触发价格               |
| slSize             | uint256 | 新的止损订单数量               |
| slPrice            | uint256 | 新的止损触发价格               |
| executionFeeToken  | address | 执行费用代币地址               |
| useOrderCollateral | bool    | 是否使用订单的保证金作为执行费 |

#### updatePriceAndAdjustCollateral

```solidity
function updatePriceAndAdjustCollateral(
    IOracle.UpdateOraclePriceParams[] calldata prices,
    OrderTypes.DepositParams calldata depositParams,
    PositionId positionId,
    int256 adjustAmount
) external payable
```

更新预言机价格并调整仓位保证金。只有仓位所有者可调用。

- 增加保证金（`adjustAmount > 0`）：降低清算风险
- 减少保证金（`adjustAmount < 0`）：提高资金利用率，系统检查是否满足最低保证金要求

**输入参数：**

| 名称         | 类型                              | 描述                                             |
| ------------ | --------------------------------- | ------------------------------------------------ |
| prices       | IOracle.UpdateOraclePriceParams[] | 预言机价格更新数据（可为空数组）                 |
| depositParams| OrderTypes.DepositParams          | 可选充值参数（增加保证金时用于充值）             |
| positionId   | PositionId                        | 要调整保证金的仓位 ID                            |
| adjustAmount | int256                            | 调整数量，正数表示增加保证金，负数表示减少保证金 |

---

### LiquidityRouter

`LiquidityRouter` 是流动性池操作和 TPSL（止盈止损）订单管理的主要入口点。

**主要功能：**

1. Base Pool 和 Quote Pool 的存款和取款操作
2. TPSL 订单的创建、管理和自动执行
3. Base Pool 取款时的资产兑换功能（Base Token 到 Quote Token）
4. 价格触发验证和订单执行机制
5. 流动性池之间的迁移

**核心方法：**

#### depositBase / depositQuote

```solidity
function depositBase(DepositParams calldata params) external
function depositBase(
    IOracle.UpdatePriceParams[] calldata prices,
    DepositParams calldata params
) external payable

function depositQuote(DepositParams calldata params) external
function depositQuote(
    IOracle.UpdatePriceParams[] calldata prices,
    DepositParams calldata params
) external payable
```

向 Base Pool 或 Quote Pool 存入流动性并铸造 LP 代币。

该函数允许用户向流动性池存入资产，作为交易对手方为协议提供流动性。存款后，用户将收到代表其份额的 LP 代币（池代币）。函数有两个版本：一个不更新价格直接存款，另一个在存款前更新预言机价格以确保使用最新价格计算 LP 代币数量。

存款流程：

1. （可选）更新预言机价格
2. 从用户账户转入资产
3. 根据当前池价格计算 LP 代币数量
4. 铸造 LP 代币给接收者
5. （可选）为新存入的 LP 创建止盈止损订单

**输入参数：**

| 名称                | 类型                        | 描述                                                   |
| ------------------- | --------------------------- | ------------------------------------------------------ |
| prices              | IOracle.UpdatePriceParams[] | （可选）预言机价格更新数据数组，用于在存款前更新池价格 |
| params              | DepositParams               | 存款参数结构体                                         |
| params.poolId       | PoolId                      | 目标池的唯一标识符                                     |
| params.amountIn     | uint256                     | 存入的资产数量（Base Token 或 Quote Token）            |
| params.minAmountOut | uint256                     | 预期接收的最小 LP 代币数量，用于滑点保护               |
| params.recipient    | address                     | 接收 LP 代币的地址                                     |
| params.tpslParams   | TpslParams[]                | 可选的止盈止损订单参数数组                             |

#### withdrawBase / withdrawQuote

```solidity
function withdrawBase(WithdrawParams calldata params) external
function withdrawBase(
    IOracle.UpdatePriceParams[] calldata prices,
    WithdrawParams calldata params
) external payable

function withdrawQuote(WithdrawParams calldata params) external
function withdrawQuote(
    IOracle.UpdatePriceParams[] calldata prices,
    WithdrawParams calldata params
) external payable
```

从 Base Pool 或 Quote Pool 取款。可选择在取款前更新预言机价格。

#### addTpsl

```solidity
function addTpsl(AddTpslParams calldata params) external
```

为现有流动性头寸添加止盈止损订单。

**TpslParams 结构：**

```solidity
struct TpslParams {
  uint256 amount; // LP代币数量
  uint256 triggerPrice; // 触发价格
  TriggerType triggerType; // 触发类型（GTE/LTE）
  uint256 minQuoteOut; // 最小报价代币输出
}
```

#### cancelTpsl

```solidity
function cancelTpsl(uint256 orderId) external
```

取消 TPSL 订单。只有订单所有者可以取消。

#### executeTpsl

```solidity
function executeTpsl(
    IOracle.UpdatePriceParams[] calldata prices,
    uint256 orderId,
    uint256 quoteInIfNecessary,
    uint256 minOut
) external payable returns (uint256 baseOut, uint256 quoteOut)

function executeTpsl(
    uint256 orderId,
    uint256 quoteInIfNecessary,
    uint256 minOut
) external returns (uint256 baseOut, uint256 quoteOut)
```

执行已触发的止盈止损订单。

当池代币价格达到用户设定的触发价格时，任何人都可以调用此函数执行 TPSL 订单。执行者需要提供必要的资产（对于 Base Pool 取款），并将获得超出用户最小预期的部分作为执行奖励。

执行条件：

- 当前池代币价格必须满足触发条件（GTE 或 LTE）
- 订单必须存在且未被取消
- 执行者需要提供足够的资产用于兑换（Base Pool 情况）

**输入参数：**

| 名称               | 类型                        | 描述                                              |
| ------------------ | --------------------------- | ------------------------------------------------- |
| prices             | IOracle.UpdatePriceParams[] | （可选）预言机价格更新数据，用于确保价格最新      |
| orderId            | uint256                     | 要执行的 TPSL 订单 ID                             |
| quoteInIfNecessary | uint256                     | 执行者提供的报价代币数量（仅 Base Pool 取款需要） |
| minOut             | uint256                     | 执行者接受的最小输出数量，防止滑点损失            |

**返回值：**

| 名称     | 类型    | 描述                                    |
| -------- | ------- | --------------------------------------- |
| baseOut  | uint256 | 输出的基础代币数量（Base Pool 取款时）  |
| quoteOut | uint256 | 输出的报价代币数量（Quote Pool 取款时） |

#### migrateLiquidity

```solidity
function migrateLiquidity(MigrateLiquidityParams calldata params) external
```

在同一市场的不同池之间迁移流动性。

**MigrateLiquidityParams 结构：**

```solidity
struct MigrateLiquidityParams {
  PoolId fromPoolId; // 源池ID
  PoolId toPoolId; // 目标池ID
  uint256 amount; // 迁移的LP代币数量
  uint256 minLpOut; // 目标池最小LP输出
}
```

#### claimBasePoolRebate / claimQuotePoolRebate

```solidity
function claimBasePoolRebate(PoolId poolId, address recipient) external
function claimBasePoolRebates(PoolId[] memory poolIds, address recipient) external
function claimQuotePoolRebate(PoolId poolId, address recipient) external
function claimQuotePoolRebates(PoolId[] memory poolIds, address recipient) external
```

领取流动性池的返佣奖励。

---

### Forwarder

`Forwarder` 实现了 ERC2771 元交易功能，允许中继器代表用户提交交易。

**主要功能：**

- 元交易转发（Gasless 交易）
- 中继器管理
- 费用收取和 Gas 赞助
- 白名单目标合约管理

**核心方法：**

#### approveForwarder

```solidity
function approveForwarder(address account, address relayer, bool enable) external
```

授权或撤销中继器代表账户转发交易。

#### executeForwarder

```solidity
function executeForwarder(ForwardRequestData calldata params) external payable
```

执行单个元交易请求。只有授权的中继器可以调用。

#### batchExecuteForwarder

```solidity
function batchExecuteForwarder(ForwardRequestData[] calldata bundleParams) external payable
```

批量执行多个元交易请求。

#### permitAndApproveForwarder

```solidity
function permitAndApproveForwarder(
    address relayer,
    bool enable,
    ERC20PermitParams[] calldata permitParams
) external
```

使用 ERC20 permit 签名和授权中继器。

## Trading（交易系统）

### OrderManager

`OrderManager` 管理订单的创建、修改、执行和追踪。它维护订单簿并为订单和仓位信息提供查询接口。

> **注意：** 订单的下达、取消和更新操作通过 `Broker` 合约执行。以下是外部调用者可用的只读查询方法。

**核心查询方法：**

#### getOrder

```solidity
function getOrder(OrderId orderId) external view returns (OrderMetadata memory)
```

获取订单的完整元数据信息。

**输入参数：**

| 名称    | 类型    | 描述            |
| ------- | ------- | --------------- |
| orderId | OrderId | 要查询的订单 ID |

**返回值：**

| 名称          | 类型          | 描述       |
| ------------- | ------------- | ---------- |
| orderMetadata | OrderMetadata | 订单元数据 |

**OrderMetadata 结构体主要字段：**

| 字段名称         | 类型        | 描述                                         |
| ---------------- | ----------- | -------------------------------------------- |
| user             | address     | 订单所有者地址                               |
| poolId           | PoolId      | 订单执行的池 ID                              |
| positionId       | PositionId  | 关联的仓位 ID（新建仓位为 0）                |
| collateralAmount | uint256     | 订单的保证金数量（代币精度）                 |
| size             | uint256     | 订单数量（基础资产单位，代币精度）           |
| price            | uint256     | 订单价格（精度 1e30）                        |
| filledSize       | uint256     | 已成交数量                                   |
| orderType        | OrderType   | 订单类型（Market、Limit、Stop、Conditional） |
| triggerType      | TriggerType | 触发条件（None、GTE、LTE）                   |
| operation        | Operation   | 操作类型（Increase、Decrease）               |
| direction        | Direction   | 交易方向（Long、Short）                      |
| timeInForce      | TimeInForce | 订单有效期（目前仅支持 IOC）                 |
| slippagePct      | uint16      | 最大滑点容忍度（精度 1e4，即 10000 = 100%）  |
| postOnly         | bool        | 是否仅挂单（true 时订单只能作为 maker）      |
| createdAt        | uint64      | 订单创建时间戳                               |
| broker           | address     | 经纪人地址（用于费用分成）                   |

#### getUserOrders

```solidity
function getUserOrders(address user) external view returns (OrderId[] memory)
```

获取用户的所有订单ID列表。

**输入参数：**

| 名称 | 类型    | 描述             |
| ---- | ------- | ---------------- |
| user | address | 要查询的用户地址 |

**返回值：**

| 名称     | 类型      | 描述         |
| -------- | --------- | ------------ |
| orderIds | OrderId[] | 订单 ID 数组 |

#### isOrderOwner

```solidity
function isOrderOwner(OrderId orderId, address user) external view returns (bool)
```

检查指定用户是否为订单所有者。

**输入参数：**

| 名称    | 类型    | 描述     |
| ------- | ------- | -------- |
| orderId | OrderId | 订单 ID  |
| user    | address | 用户地址 |

**返回值：**

| 名称    | 类型 | 描述             |
| ------- | ---- | ---------------- |
| isOwner | bool | 是否为订单所有者 |

---

### PositionManager

`PositionManager` 管理交易仓位及其生命周期。通过 ERC721 实现，每个仓位都是一个 NFT。

**核心查询方法：**

#### getPosition

```solidity
function getPosition(PositionId positionId) external view returns (PositionMetadata memory)
```

获取仓位的完整元数据信息。

**输入参数：**

| 名称       | 类型       | 描述            |
| ---------- | ---------- | --------------- |
| positionId | PositionId | 要查询的仓位 ID |

**返回值：**

| 名称             | 类型             | 描述       |
| ---------------- | ---------------- | ---------- |
| positionMetadata | PositionMetadata | 仓位元数据 |

**PositionMetadata 结构体主要字段：**

| 字段名称         | 类型      | 描述                               |
| ---------------- | --------- | ---------------------------------- |
| poolId           | PoolId    | 仓位所在的池 ID                    |
| size             | uint256   | 仓位数量（基础资产单位，代币精度） |
| entryPrice       | uint256   | 开仓均价（精度 1e30）              |
| fundingRateIndex | int256    | 资金费率追踪索引                   |
| earlyClosePrice  | uint256   | 预设提前平仓价格（0 表示未设置）   |
| direction        | Direction | 仓位方向（Long、Short）            |
| riskTier         | uint8     | 开仓时的风险等级                   |
| entryTime        | uint64    | 首次开仓时间戳                     |
| lastUpdateTime   | uint64    | 最后更新时间戳                     |

#### getPositionOwner

```solidity
function getPositionOwner(PositionId positionId) external view returns (address)
```

获取仓位的所有者地址。

**输入参数：**

| 名称       | 类型       | 描述    |
| ---------- | ---------- | ------- |
| positionId | PositionId | 仓位 ID |

**返回值：**

| 名称  | 类型    | 描述           |
| ----- | ------- | -------------- |
| owner | address | 仓位所有者地址 |

#### getOITracker

```solidity
function getOITracker(PoolId poolId) external view returns (OITracker memory)
```

获取池的开仓量追踪信息。

**输入参数：**

| 名称   | 类型   | 描述  |
| ------ | ------ | ----- |
| poolId | PoolId | 池 ID |

**返回值：**

| 名称      | 类型      | 描述           |
| --------- | --------- | -------------- |
| oiTracker | OITracker | 开仓量追踪信息 |

**OITracker 结构体字段：**

| 字段名称       | 类型    | 描述                      |
| -------------- | ------- | ------------------------- |
| tracker        | int256  | 净仓位追踪器（多头-空头） |
| longSize       | uint256 | 总多头仓位数量            |
| shortSize      | uint256 | 总空头仓位数量            |
| poolEntryPrice | uint256 | 池的平均开仓价格          |

#### getUserPositions

```solidity
function getUserPositions(address user) external view returns (PositionId[] memory)
```

获取用户的所有仓位ID列表。

**输入参数：**

| 名称 | 类型    | 描述     |
| ---- | ------- | -------- |
| user | address | 用户地址 |

**返回值：**

| 名称        | 类型         | 描述         |
| ----------- | ------------ | ------------ |
| positionIds | PositionId[] | 仓位 ID 数组 |

#### getUserPoolPositionIds

```solidity
function getUserPoolPositionIds(address user, PoolId poolId) external view returns (PositionId[] memory)
```

获取用户在特定池中的所有仓位 ID 列表。

**输入参数：**

| 名称   | 类型    | 描述       |
| ------ | ------- | ---------- |
| user   | address | 用户地址   |
| poolId | PoolId  | 按此池过滤 |

**返回值：**

| 名称        | 类型         | 描述             |
| ----------- | ------------ | ---------------- |
| positionIds | PositionId[] | 该池中的仓位 ID 数组 |

#### isPositionExists

```solidity
function isPositionExists(PositionId positionId) external view returns (bool)
```

检查仓位是否存在。

**输入参数：**

| 名称       | 类型       | 描述       |
| ---------- | ---------- | ---------- |
| positionId | PositionId | 仓位 ID    |

**返回值：**

| 名称   | 类型 | 描述           |
| ------ | ---- | -------------- |
| exists | bool | 仓位是否存在   |

#### getPositionByTokenId

```solidity
function getPositionByTokenId(uint256 tokenId) external view returns (PositionMetadata memory)
```

通过 NFT token ID 获取仓位元数据。

由于仓位是 ERC721 NFT，此函数可以使用 NFT token ID 而不是仓位 ID 来检索仓位。

**输入参数：**

| 名称    | 类型    | 描述        |
| ------- | ------- | ----------- |
| tokenId | uint256 | NFT token ID |

**返回值：**

| 名称             | 类型             | 描述       |
| ---------------- | ---------------- | ---------- |
| positionMetadata | PositionMetadata | 仓位元数据 |

> **注意：** 仓位的执行、保证金调整和平仓操作通过 `Broker` 合约或内部系统调用执行。以上是外部调用者可用的只读查询方法。

**仓位 NFT 方法：**

#### mintPositionNFT

```solidity
function mintPositionNFT(PositionId positionId, address recipient) external returns (PositionId newPositionId, uint256 tokenId)
```

铸造代表仓位的 NFT（ERC721 转移）。

仓位可以作为 NFT 转移。此函数为仓位转移铸造 NFT。

**输入参数：**

| 名称       | 类型       | 描述            |
| ---------- | ---------- | --------------- |
| positionId | PositionId | 要铸造 NFT 的仓位 ID |
| recipient  | address    | NFT 接收者      |

**返回值：**

| 名称          | 类型       | 描述       |
| ------------- | ---------- | ---------- |
| newPositionId | PositionId | 新仓位 ID  |
| tokenId       | uint256    | NFT token ID |

---

## Pool（流动性池系统）

### PoolManager

`PoolManager` 管理流动性池的创建、配置和生命周期。

**主要功能：**

- 池创建和注册
- 池状态管理
- 池配置更新

**核心方法：**

#### getPool

```solidity
function getPool(PoolId poolId) external view returns (PoolMetadata memory)
```

获取池的元数据。

#### checkPoolExists

```solidity
function checkPoolExists(PoolId poolId) external view returns (bool)
```

检查池是否存在。

---

### BasePool / QuotePool

Base Pool 和 Quote Pool 管理流动性提供和交易对手方。

**主要功能：**

- 流动性存取款
- 池代币（LP Token）铸造和销毁
- 费用分配
- 返佣管理

**核心方法：**

#### deposit

```solidity
function deposit(
    PoolId poolId,
    uint256 amountIn,
    uint256 minAmountOut,
    address from,
    address recipient
) external returns (uint256 lpOut)
```

存入流动性，铸造 LP 代币。

#### withdraw

```solidity
function withdraw(
    PoolId poolId,
    uint256 lpAmount,
    uint256 minAmountOut,
    address from,
    address recipient
) external returns (uint256 amountOut, uint256 rebateOut)
```

销毁 LP 代币，取出流动性。

---

## RiskParameter（风险参数）

### RiskParameter

`RiskParameter` 管理不同风险等级的参数配置，为各个池提供风险控制基准。

**主要功能：**

- **风险等级配置**：管理不同 riskTier 的参数集合
- **杠杆和保证金管理**：配置最大杠杆和维持保证金率
- **滑点和流动性参数**：设置基础滑点和窗口容量限制
- **资金费率参数**：配置资金费率计算的各项参数
- **抵押品参数**：设置基础代币作为抵押品的比例

**核心查询方法：**

#### getRiskParamData

```solidity
function getRiskParamData(uint8 riskTier) external view returns (RiskParamData memory)
```

获取指定风险等级的完整参数配置。

**输入参数：**

| 名称     | 类型  | 描述                                |
| -------- | ----- | ----------------------------------- |
| riskTier | uint8 | 风险等级（0-255，数字越大风险越高） |

**返回值：**

| 名称       | 类型          | 描述             |
| ---------- | ------------- | ---------------- |
| riskParams | RiskParamData | 风险参数数据结构 |

**RiskParamData 结构体字段：**

| 字段名称                 | 类型              | 描述                                                |
| ------------------------ | ----------------- | --------------------------------------------------- |
| minTradeUsd              | uint128           | 最小交易金额（USD，精度基于 USD_DECIMALS = 6）      |
| maxWindowCapUsd          | uint128           | 时间窗口内最大交易容量（USD）                       |
| windowSize               | uint64            | 时间窗口大小（秒）                                  |
| priceRangePct            | uint16            | 价格范围百分比（精度 1e4，即 10000 = 100%）         |
| baseSlippage             | uint16            | 基础滑点（精度 1e4）                                |
| leverage                 | uint16            | 最大杠杆倍数（10 = 10倍杠杆）                       |
| maintainMarginRate       | uint16            | 维持保证金率（精度 1e4，例如 500 = 5%）             |
| baseTokenCollateralRatio | uint16            | 基础代币作为抵押品的比例（精度 1e2，即 100 = 100%） |
| exchangeIncentiveRate    | uint16            | 兑换激励率（精度 1e4）                              |
| assetClass               | AssetClass        | 资产类别（SPOT、PERPETUAL 等）                      |
| genesisRebateRatio       | uint16            | 创世流动性返佣比例（精度 1e4）                      |
| fundingRateParams        | FundingRateParams | 资金费率参数                                        |

**FundingRateParams 结构体字段：**

| 字段名称         | 类型   | 描述                     |
| ---------------- | ------ | ------------------------ |
| maxRate          | int32  | 最大资金费率（精度 1e8） |
| equilibriumRange | uint32 | 平衡范围（精度 1e8）     |
| lowGrowthRate    | int32  | 低增长率（精度 1e8）     |
| highGrowthRate   | int32  | 高增长率（精度 1e8）     |
| epochDuration    | uint64 | 资金费率计算周期（秒）   |

#### getFundingRateParams

```solidity
function getFundingRateParams(uint8 riskTier) external view returns (FundingRateParams memory)
```

获取指定风险等级的资金费率参数。

**输入参数：**

| 名称     | 类型  | 描述     |
| -------- | ----- | -------- |
| riskTier | uint8 | 风险等级 |

**返回值：**

| 名称              | 类型              | 描述             |
| ----------------- | ----------------- | ---------------- |
| fundingRateParams | FundingRateParams | 资金费率参数结构 |

---

### 风险控制机制说明

#### 1. 流动性锁定机制

流动性锁定通过以下方式保护流动性提供者：

- **时间窗口限制**：在指定的时间窗口内（如 1 小时），限制可消耗的流动性总量
- **价格范围限制**：锁定一个价格范围（如 ±5%），超出范围时重置窗口
- **开仓量追踪**：累积计算窗口内的净开仓量，防止单边风险过大

**工作原理：**

1. 每个池维护一个流动性锁定状态（windowAnchor, priceFloor, priceCeiling, openInterest）
2. 新订单执行时检查是否在当前窗口和价格范围内
3. 如果超出时间或价格范围，创建新窗口
4. 累积的 openInterest 不能超过 maxWindowCapUsd

#### 2. 保证金和清算机制

- **初始保证金**：开仓时需要满足的最低保证金要求 = 仓位价值 / leverage
- **维持保证金**：维持仓位所需的最低保证金 = 仓位价值 × maintainMarginRate
- **清算触发**：当账户保证金率低于维持保证金率时触发清算

**保证金率计算：**

```
保证金率 = (账户权益 / 仓位价值) × 100%
账户权益 = 保证金 + 未实现盈亏 - 资金费用
```

#### 3. 风险等级体系

协议支持多个风险等级（riskTier），不同等级有不同的风险参数：

- **低风险等级（0-2）**：高流动性资产，高杠杆，低滑点
- **中风险等级（3-5）**：一般流动性资产，中等杠杆
- **高风险等级（6+）**：低流动性资产，低杠杆，高滑点

每个池在创建时分配一个 riskTier，后续可通过治理调整。

#### 4. 风险参数示例

**典型的低风险配置（如 BTC/USDC）：**

- leverage: 50（最大50倍杠杆）
- maintainMarginRate: 500（5% 维持保证金率）
- maxWindowCapUsd: 10000000（1000万USD窗口容量）
- windowSize: 3600（1小时窗口）
- priceRangePct: 500（±5% 价格范围）

**典型的高风险配置（如山寨币）：**

- leverage: 10（最大10倍杠杆）
- maintainMarginRate: 1000（10% 维持保证金率）
- maxWindowCapUsd: 1000000（100万USD窗口容量）
- windowSize: 1800（30分钟窗口）
- priceRangePct: 1000（±10% 价格范围）

## 错误定义（Errors）

协议定义了标准化的错误类型，用于明确指示操作失败的原因。每个错误都有唯一的选择器（Selector）用于识别。

### 权限和访问控制错误

| 错误签名                            | 选择器       | 描述                             |
| ----------------------------------- | ------------ | -------------------------------- |
| `PermissionDenied(address,address)` | `0xe03f6024` | 调用者没有权限执行目标合约的操作 |

---

### 市场和池相关错误

| 错误签名                          | 选择器       | 描述                   |
| --------------------------------- | ------------ | ---------------------- |
| `MarketNotExist(bytes32)`         | `0x24e219c7` | 市场不存在             |
| `MarketNotInitialized()`          | `0xd8daec7c` | 市场未初始化           |
| `PoolNotExist(bytes32)`           | `0x51aeee6c` | 池不存在               |
| `PoolExists(bytes32)`             | `0xcc36f935` | 池已存在，无法重复创建 |
| `PoolNotActive(bytes32)`          | `0xba01b06f` | 池未激活，无法执行交易 |
| `PoolNotCompoundable(bytes32)`    | `0xba8f5df5` | 池不支持复利功能       |
| `PoolNotInPreBenchState(bytes32)` | `0x230e8e43` | 池不在预启动状态       |
| `PoolNotInitialized()`            | `0x486aa307` | 池未初始化             |

---

### 订单相关错误

| 错误签名                                         | 选择器       | 描述                     |
| ------------------------------------------------ | ------------ | ------------------------ |
| `NotOrderOwner()`                                | `0xf6412b5a` | 调用者不是订单所有者     |
| `InvalidOrder(bytes32)`                          | `0xd8cf2fdb` | 订单无效或参数不符合要求 |
| `OrderExpired(bytes32)`                          | `0x2e775cae` | 订单已过期               |
| `OrderNotExist(bytes32)`                         | `0x3b51fbd2` | 订单不存在               |
| `NotReachedPrice(bytes32,uint256,uint256,uint8)` | `0xc1d5fb38` | 市场价格未达到触发条件   |

---

### 仓位相关错误

| 错误签名                                  | 选择器       | 描述                                 |
| ----------------------------------------- | ------------ | ------------------------------------ |
| `NotPositionOwner()`                      | `0x70d645e3` | 调用者不是仓位所有者                 |
| `InvalidPosition(bytes32)`                | `0x8ea9158f` | 仓位无效或参数不符合要求             |
| `PositionNotHealthy(bytes32,uint256)`     | `0xa5afd143` | 仓位不健康，保证金率低于维持保证金率 |
| `PositionRemainsHealthy(bytes32)`         | `0xc53f84e7` | 仓位健康，无法清算                   |
| `PositionNotInitialized(bytes32)`         | `0xba0d3752` | 仓位未初始化                         |
| `InsufficientCollateral(bytes32,uint256)` | `0x5646203f` | 仓位保证金不足                       |
| `ExceedMaxLeverage(bytes32)`              | `0xb4762117` | 仓位杠杆超过最大允许值               |

---

### ADL（自动减仓）错误

| 错误签名                              | 选择器       | 描述             |
| ------------------------------------- | ------------ | ---------------- |
| `InvalidADLPosition(bytes32,bytes32)` | `0x096f8c05` | ADL 仓位选择无效 |
| `NoADLNeeded(bytes32)`                | `0x24be95bb` | 不需要执行 ADL   |

---

### 经纪人错误

| 错误签名                   | 选择器       | 描述                       |
| -------------------------- | ------------ | -------------------------- |
| `NotActiveBroker(address)` | `0x27d08510` | 经纪人未激活或不在注册列表 |

---

### 流动性和余额错误

| 错误签名                                         | 选择器       | 描述                             |
| ------------------------------------------------ | ------------ | -------------------------------- |
| `InsufficientBalance(address,uint256,uint256)`   | `0xdb42144d` | 账户余额不足                     |
| `InsufficientLiquidity(uint256,uint256,uint256)` | `0xd54d0fc4` | 池流动性不足                     |
| `InsufficientOutputAmount()`                     | `0x42301c23` | 输出数量低于最小要求（滑点保护） |
| `ExceedMinOutputAmount()`                        | `0xdc82bd68` | 超过最小输出数量限制             |
| `InsufficientSize()`                             | `0xc6e8248a` | 订单或仓位数量不足               |

---

### 价格和预言机错误

| 错误签名                    | 选择器       | 描述                   |
| --------------------------- | ------------ | ---------------------- |
| `StalePrice()`              | `0x19abf40e` | 价格数据过期           |
| `InvalidPrice()`            | `0x00bfc921` | 价格无效或为零         |
| `ExceedMaxPriceDeviation()` | `0xfd0f789d` | 价格偏差超过最大允许值 |
| `InvalidRewindPrice()`      | `0x7a5c919f` | 时间回溯价格无效       |

---

### 兑换和返佣错误

| 错误签名                                    | 选择器       | 描述                     |
| ------------------------------------------- | ------------ | ------------------------ |
| `InsufficientReturnAmount(uint256,uint256)` | `0x14be833f` | 兑换回调返回数量不足     |
| `ExceedMaxExchangeableAmount()`             | `0xe351cd13` | 超过最大可兑换数量       |
| `ConvertAmountMismatch(uint256,uint256)`    | `0xba767932` | 转换输出与兑换使用不匹配 |
| `NoRebateToClaim()`                         | `0x80577032` | 没有可领取的返佣         |

---

### 其他错误

| 错误签名                             | 选择器       | 描述               |
| ------------------------------------ | ------------ | ------------------ |
| `NotMeetEarlyCloseCriteria(bytes32)` | `0x17229ec4` | 不满足提前平仓条件 |
| `OnlyRelayer()`                      | `0x4578ddb8` | 仅中继器可调用     |
| `InvalidParameter()`                 | `0x613970e0` | 参数无效           |
| `TransferFailed()`                   | `0x90b8ec18` | 代币转账失败       |
| `InsufficientRiskReserves()`         | `0x6aee3c1a` | 风险储备金不足     |

---

## 相关资源

- **源代码**: [GitHub Repository](https://github.com/myx-protocol)
- **安全审计**: [审计报告](./security-audits.md)
- **部署地址**: [合约地址](./deployed-addresses.md)
- **API 文档**: [完整 API 文档](./API_Documentation_CN.md)

---

_本文档基于 MYX Protocol V2。合约地址可通过 Address Book 以 Solidity 或 JavaScript 包的形式导入。_
