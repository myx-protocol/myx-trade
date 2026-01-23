import type { Address } from "viem";
export interface GetHistoryOrdersParams {
  limit?: number;
  chainId?: number;
  poolId?: string;
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

export enum TradeFlowTypeEnum {
  Increase = 0,
  Decrease = 1,
  AddMargin = 2,
  RemoveMargin = 3,
  CancelOrder = 4,
  ADL = 5,
  Liquidation = 6,
  MarketClose = 7,
  EarlyClose = 8,
  AddTPSL = 9,
  SecurityDeposit = 10,
  TransferToWallet = 11,
  MarginAccountDeposit = 12,
  ReferralReward = 13,
  ReferralRewardClaim = 14,
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
  Market = 1, // market order
  Limit = 2, // limit order
  TP = 3, // take profit order
  SL = 4, // stop loss order
  ADL = 5, // auto deleverage order
  ADLTrigger = 6, // auto deleverage trigger order
  Liquidation = 7, // liquidation order
  EarlyClose = 8, // early close order
  MarketClose = 9, // market close order
}

export interface HistoryOrderItem {
  chainId: number; // chainId
  poolId: string; // poolId
  orderId: number; // orderId
  txTime: number; // txTime
  txHash: string; // txHash
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
  cancelReason?: string; // cancel reason
}

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

/**
 * Get Trade Flow
 */
export enum TradeFlowAccountTypeEnum {
  MarginAccount = 1,
  WalletAccount = 2,
  ReferralReward = 3,
}
export interface TradeFlowItem {
  chainId: number;
  orderId: number;
  user: Address;
  poolId: string;
  fundingFee: string;
  tradingFee: string;
  charge: string;
  collateralAmount: string; // collateral quote amount
  collateralBase: string; // collateral base amount
  txHash: string;
  txTime: number;
  type: TradeFlowTypeEnum; // operation type
  accountType: TradeFlowAccountTypeEnum; // account type
  executionFee: string; // execution fee type=9(use execution fee)
  seamlessFee: string; // seamless fee
  seamlessFeeSymbol: string; // seamless fee symbol
  basePnl: string; // base pnl
  quotePnl: string; // quote pnl
  referrerRebate: string; // referrer rebate(type=13)
  referralRebate: string; // referral rebate(type=13)
  rebateClaimedAmount: string; // rebate claimed amount(type=14)
  token?: Address; // type=11|type=12(transfer token)
}
