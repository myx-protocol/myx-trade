import * as ethers from 'ethers';
import { AddressLike, Signer } from 'ethers';

declare enum ChainId {
    LINEA_SEPOLIA = 59141,
    LINEA_MAINNET = 59144,
    ARB_TESTNET = 421614,
    ARB_MAINNET = 42161,
    OPBNB_TESTNET = 5611,
    OPBNB_MAINNET = 204,
    SCROLL_MAINNET = 534352,
    BSC_TESTNET = 97,
    BSC_MAINNET = 56
}

declare const OrderType: {
    readonly MARKET: 0;
    readonly LIMIT: 1;
    readonly STOP: 2;
    readonly CONDITIONAL: 3;
};
type OrderType = typeof OrderType[keyof typeof OrderType];
declare const TriggerType: {
    readonly NONE: 0;
    readonly GTE: 1;
    readonly LTE: 2;
};
type TriggerType = typeof TriggerType[keyof typeof TriggerType];
declare const OperationType: {
    readonly INCREASE: 0;
    readonly DECREASE: 1;
};
type OperationType = typeof OperationType[keyof typeof OperationType];
declare const Direction: {
    readonly LONG: 0;
    readonly SHORT: 1;
};
type Direction = typeof Direction[keyof typeof Direction];
declare const TimeInForce: {
    readonly IOC: 0;
};
type TimeInForce = typeof TimeInForce[keyof typeof TimeInForce];

type UserFeeRateParams = {
    address: AddressLike;
    poolId: string;
    chainId: ChainId;
    singer: Signer;
};
type PlaceOrderParams = {
    chainId: ChainId;
    address: AddressLike;
    poolId: string;
    positionId: number;
    orderType: OrderType;
    triggerType: TriggerType;
    operation: OperationType;
    direction: Direction;
    collateralAmount: string;
    size: string;
    orderPrice: string;
    triggerPrice: string;
    timeInForce: TimeInForce;
    postOnly: boolean;
    slippagePct: string;
    executionFeeToken: AddressLike;
    leverage: number;
    tpSize: string;
    tpPrice: string;
    slSize: string;
    slPrice: string;
};

declare const getUserFeeRate: ({ address, poolId, chainId }: UserFeeRateParams, singer: Signer) => Promise<[bigint, bigint, bigint, bigint] & {
    takerFeeRate: bigint;
    makerFeeRate: bigint;
    baseTakerFeeRate: bigint;
    baseMakerFeeRate: bigint;
}>;
declare const placeOrder: (params: PlaceOrderParams, singer: Signer) => Promise<ethers.ContractTransactionReceipt | null>;
declare const cancelOrder: (chainId: ChainId, orderId: string, singer: Signer) => Promise<ethers.ContractTransactionReceipt | null>;
declare const cancelOrders: (chainId: ChainId, orderIds: string[], singer: Signer) => Promise<ethers.ContractTransactionReceipt | null>;
declare const adjustCollateral: (chainId: ChainId, positionId: string, adjustAmount: string, singer: Signer) => Promise<ethers.ContractTransactionReceipt | null>;

export { adjustCollateral, cancelOrder, cancelOrders, getUserFeeRate, placeOrder };
