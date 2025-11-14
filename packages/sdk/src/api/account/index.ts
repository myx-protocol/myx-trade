import { Address } from "@/address";
import { AccessTokenRequest, ApiResponse } from "../type";
import { http } from "../request";
import { baseUrl } from "..";

export interface GetHistoryOrdersParams {
  limit?: number;
  chainId?: number;
  poolId?: string
}

export enum OrderTypeEnum {
  Market = 0,
  Limit = 1,
  Stop = 2,
  Conditional = 3,
}

export enum OperationEnum {
  Increase = 0,
  Decrease = 1,
}

export enum TriggerTypeEnum {
  Unknown = 0,
  GTE = 1,
  LTE = 2,
}

export enum DirectionEnum {
  Long = 0,
  Short = 1,
}

export enum OrderStatusEnum {
  Cancelled = 1,
  Expired = 2,
  Successful = 9,
}

export enum ExecTypeEnum {
  UserEntrust = 0,
  Liquidation = 1,
  Adl = 2,
  AdlTrigger = 3,
}

export interface HistoryOrderItem {
  chainId: number; // chainId
  poolId: string; // poolId
  orderId: number; // orderId
  txTime: number; // txTime
  txHash: number; // txHash
  orderType: OrderTypeEnum; // orderType
  operation: OperationEnum; // operation
  triggerType: TriggerTypeEnum; // triggerType
  direction: DirectionEnum; // direction
  size: string; // size amount
  filledSize: string; // filled size amount
  filledAmount: string; // filled amount
  price: string; // price
  lastPrice: string; // last price(avg price)
  orderStatus: OrderStatusEnum; // order status
  execType: ExecTypeEnum; // exec type
  slippagePct: number; // slippage percentage
  executionFeeToken: Address; // execution fee token
  executionFeeAmount: string; // execution fee amount
  tradingFee: string; // trading fee
  fundingFee: string; // funding fee
  realizedPnl: string; // realized pnl
  baseSymbol: string; // base symbol
  quoteSymbol: string; // quote symbol
  userLeverage: number; // leverage
}

/**
 * Get history orders
 */
export const getHistoryOrders = async ({
  accessToken,
  ...params
}: GetHistoryOrdersParams & AccessTokenRequest) => {
  return http.get<ApiResponse<HistoryOrderItem[]>>(
    `${baseUrl}/openapi/gateway/scan/order/closed`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

/**
 * Get position history
 */

export enum CloseTypeEnum {
  Open = 0,
  PartialClose = 1,
  FullClose = 2,
  Liquidation = 3,
  EarlyClose = 4,
  MarketClose = 5,
  ADL = 6,
  TP = 7,
  SL = 8,
  Increase = 9,
}
export interface PositionHistoryItem {
  chainId: number;
  poolId: string;
  positionId: number;
  direction: DirectionEnum;
  entryPrice: string;
  fundingRateIndex: string;
  size: string;
  filledSize: string;
  riskTier: number;
  collateralAmount: string;
  openTime: number;
  closeTime: number;
  realizedPnl: string;
  baseSymbol: string; // base symbol
  quoteSymbol: string; // quote symbol
  userLeverage: number; // leverage
  closeType: CloseTypeEnum; // close type
  avgClosePrice: string; // average close price
}

export const getPositionHistory = async ({
  accessToken,
  ...params
}: GetHistoryOrdersParams & AccessTokenRequest) => {
  return http.get<ApiResponse<PositionHistoryItem[]>>(
    `${baseUrl}/openapi/gateway/scan/position/closed`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};

/**
 * Get Trade Flow
 */
export interface TradeFlowItem {
  chainId: number;
  orderId: number;
  user: Address;
  poolId: string;
  realizedPnl: string;
  fundingFee: string;
  tradingFee: string;
  charge: string;
  beforeCollateralAmount: string;
  afterCollateralAmount: string;
  txHash: string;
  txTime: number;
  baseSymbol: string; // base symbol
  quoteSymbol: string; // quote symbol
  userLeverage: number; // leverage
  executionFee: string; // execution fee
  type: OperationEnum; // operation type
}
export const getTradeFlow = async ({
  accessToken,
  ...params
}: GetHistoryOrdersParams & AccessTokenRequest) => {
  return http.get<ApiResponse<TradeFlowItem[]>>(
    `${baseUrl}/openapi/gateway/scan/trade/flow`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    }
  );
};
