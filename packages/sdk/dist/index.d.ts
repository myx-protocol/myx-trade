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

interface ObjectType<T> {
    [key: string]: T;
}
type Address = `0x${string}`;
type NetWorkFee = {
    paymentType: number;
    volScale: number;
};
declare enum ErrorCode {
    SUCCESS = 9200,
    SUCCESS_ORIGIN = 0,
    IDENTITY_VERIFICATION_FAILED = 9401,
    PERMISSION_DENIED = 9403,
    NOT_EXIST = 9404,
    REQUEST_LIMIT = 9429,
    SERVICE_ERROR = 9500,
    MISS_REQUESTED_PARAMETER = 9900,
    INVALID_PARAMETER = 9901,
    NETWORK_ERROR = "ERR_NETWORK"
}
interface BaseResponse {
    code: ErrorCode;
    msg: string | null;
}
type DashboardType = {
    lpAsset: string;
    cumTradeAmount: string;
    cumEarnings: string;
    accountCount: number;
    positionAmount: string;
    positionAmountRate: string | number;
    accountCountRate: string | number;
    tradeAmountRate: number | string;
    lpAssetRate: string | number;
    earningsRate: string | number;
};
interface StatDashBoardResponse extends BaseResponse {
    data: DashboardType;
}
declare enum MarketPoolState {
    Cook = 0,// 市场建立
    Primed = 1,// 扣款手续费，等待准备oracle
    Trench = 2,// 上架交易
    PreBench = 3,// 预下架
    Bench = 4
}
type MarketPool = {
    "chainId": number;
    "marketId": string;
    "poolId": string;
    "oracleId": number;
    "globalId": number;
    "state": MarketPoolState;
    "baseSymbol": string;
    "quoteSymbol": string;
    "baseDecimals": number;
    "quoteDecimals": number;
    "baseToken": string;
    "quoteToken": string;
    "basePoolToken": string;
    "quotePoolToken": string;
    "oracleType": number;
    "feedId": number;
    "activeTime": number;
};
interface MarketPoolResponse extends BaseResponse {
    data: MarketPool[];
}
declare enum OracleType {
    Pyth = 0,
    Chainlink = 1
}
type PriceType = {
    oracleId: number;
    price: string;
    vaa: string;
    publishTime: number;
    oracleType?: OracleType;
    nativeFee?: number | string;
};
interface PriceResponse extends BaseResponse {
    data: PriceType[];
}

declare const getPools: () => Promise<MarketPoolResponse>;
declare const getPrice: (chainId: ChainId, poolIds?: string[]) => Promise<PriceResponse>;

export { type Address, type BaseResponse, type DashboardType, ErrorCode, type MarketPool, type MarketPoolResponse, MarketPoolState, type NetWorkFee, type ObjectType, OracleType, type PriceResponse, type PriceType, type StatDashBoardResponse, adjustCollateral, cancelOrder, cancelOrders, getPools, getPrice, getUserFeeRate, placeOrder };
