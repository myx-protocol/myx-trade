import { msg } from '@lingui/core/macro'
import { TransactionState } from './types'
import type { MessageDescriptor } from '@lingui/core'

interface BaseOptionType<T = any> {
  label: MessageDescriptor
  value: T
}

export enum TransactionType {
  APPROVE,
  OPEN_POSITION,
  CLOSE_POSITION,
  INCREASE_COLLATERAL,
  DECREASE_COLLATERAL,
  TP_SL,
  CANCEL_TP,
  CANCEL_SL,
  CANCEL_OPEN,
  CANCEL_CLOSE,
  BUY_MLP,
  SELL_MLP,
  FAUCET,
  CANCEL_ALL,
  CLOSE_POSITION_ALL,
  CLAIM_REFERRAL_FEE,
  CLAIM_AIRDROP,
  DESPOSIT,
  WITHDRAW,
  STAKING,
  UNSTAKE,
  STAKING_CLAIM,
  REWARD_CLAIM,
  REWARD_VESTING,
}

// {
//   success: msg`Order confirmed`,
//   fail: msg`Order Rejected`
// }

type TRANSACTIONS_OPTIONS_TYPE = BaseOptionType<TransactionType> & {
  transactionLabel?: {
    confirm: MessageDescriptor
    fail: MessageDescriptor
  }
}

export const TRANSACTIONS_OPTIONS = [
  {
    label: msg`授权`,
    value: TransactionType.APPROVE,
  },
  {
    label: msg`开仓`,
    value: TransactionType.OPEN_POSITION,
    transactionLabel: {
      confirm: msg`Order confirmed`,
      fail: msg`Order Rejected`,
    },
  },
  { label: msg`Faucet`, value: TransactionType.FAUCET },
  {
    label: msg`平仓`,
    value: TransactionType.CLOSE_POSITION,
    transactionLabel: {
      confirm: msg`Order confirmed`,
      fail: msg`Order Rejected`,
    },
  },
  { label: msg`增加保证金`, value: TransactionType.INCREASE_COLLATERAL },
  { label: msg`提取保证金`, value: TransactionType.DECREASE_COLLATERAL },
  {
    label: msg`止盈止损`,
    value: TransactionType.TP_SL,
    transactionLabel: {
      confirm: msg`Order confirmed`,
      fail: msg`Order Rejected`,
    },
  },
  { label: msg`取消止盈`, value: TransactionType.CANCEL_TP },
  { label: msg`取消止损`, value: TransactionType.CANCEL_SL },
  { label: msg`取消开仓`, value: TransactionType.CANCEL_OPEN },
  { label: msg`取消平仓`, value: TransactionType.CANCEL_CLOSE },
  { label: msg`购买MLP`, value: TransactionType.BUY_MLP },
  { label: msg`出售MLP`, value: TransactionType.SELL_MLP },
  { label: msg`全部撤销`, value: TransactionType.CANCEL_ALL },
  { label: msg`全部平仓`, value: TransactionType.CLOSE_POSITION_ALL },
  { label: msg`Claim referral fee`, value: TransactionType.CLAIM_REFERRAL_FEE },
  { label: msg`Claim airdrop`, value: TransactionType.CLAIM_AIRDROP },
  { label: msg`Hypervault Purchase`, value: TransactionType.DESPOSIT },
  { label: msg`Hypervault Sale`, value: TransactionType.WITHDRAW },
  { label: msg`Staking`, value: TransactionType.STAKING },
  { label: msg`Staking Unlock`, value: TransactionType.UNSTAKE },
  { label: msg`Staking Claim`, value: TransactionType.STAKING_CLAIM },
  { label: msg`Reward Claim`, value: TransactionType.REWARD_CLAIM },
  { label: msg`Reward Vesting`, value: TransactionType.REWARD_VESTING },
] as Readonly<TRANSACTIONS_OPTIONS_TYPE[]>

export const TRANSACTIONS = TRANSACTIONS_OPTIONS.reduce<
  Record<TransactionType, TRANSACTIONS_OPTIONS_TYPE>
>(
  (acc, option) => ({
    ...acc,
    [option.value]: option,
  }),
  {} as any,
)

export const CANCEL_TRANSACTION_TYPES: TransactionType[] = [
  TransactionType.CANCEL_ALL,
  TransactionType.CANCEL_CLOSE,
  TransactionType.CANCEL_OPEN,
  TransactionType.CANCEL_SL,
  TransactionType.CANCEL_TP,
]

export const CLOSE_POSITION_TRANSACTION_TYPES: TransactionType[] = [
  TransactionType.CLOSE_POSITION_ALL,
  TransactionType.CLOSE_POSITION,
]

export const TRANSACTION_STATE_TOAST_LABEL: Record<TransactionState, MessageDescriptor> = {
  [TransactionState.TIMEOUT]: msg`On-chain Transaction timed out`,
  [TransactionState.Finalized]: msg`On-chain Transaction confirmed`,
  [TransactionState.WRONG]: msg`On-chain Transaction Rejected`,
  [TransactionState.PENDING]: msg`On-chain Transaction pending`,
}
