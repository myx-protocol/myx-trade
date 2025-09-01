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

declare enum OrderType {
    MARKET = 0,
    LIMIT = 1,
    STOP = 2,// TPSL
    CONDITIONAL = 3
}
declare enum TriggerType {
    NONE = 0,
    GTE = 1,
    LTE = 2
}
declare enum OperationType {
    INCREASE = 0,
    DECREASE = 1
}
declare enum Direction {
    LONG = 0,
    SHORT = 1
}
declare enum TimeInForce {
    IOC = 0
}

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
