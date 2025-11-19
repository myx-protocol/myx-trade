import type { TransactionType } from './options'

export enum TransactionState {
  PENDING,
  WRONG,
  Finalized,
  TIMEOUT,
}

export interface TransactionDetails {
  hash: string
  addedTime: number
  confirmedTime?: number
  deadline?: number
  from: string
  state: TransactionState
  info: TransactionInfo
}

interface BaseTransactionInfo {
  type: TransactionType
}

export type CancelOrderTransactionType =
  | TransactionType.CANCEL_ALL
  | TransactionType.CANCEL_CLOSE
  | TransactionType.CANCEL_OPEN
  | TransactionType.CANCEL_SL
  | TransactionType.CANCEL_TP

export interface CancelOrderTransactionInfo extends BaseTransactionInfo {
  type: CancelOrderTransactionType
  orderIds: number[]
}

export type ClosePositionTransactionType =
  | TransactionType.CLOSE_POSITION
  | TransactionType.CLOSE_POSITION_ALL

export interface ClosePositionTransactionInfo extends BaseTransactionInfo {
  type: ClosePositionTransactionType
  positionKeys: string[]
}

export type TransactionInfo = Prettify<
  BaseTransactionInfo | CancelOrderTransactionInfo | ClosePositionTransactionInfo
>

export enum TransactionReceiptStatus {
  SUCCESS = 1,
  REVERT = 0,
}
