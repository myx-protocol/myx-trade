export enum PoolTxType {
  Adjust_Margin,
  DepositBase,
  DepositQuote,
  WithdrawBase,
  WithdrawQuote,
  ClaimBaseRewards,
  ClaimQuoteRewards,
}

export enum PoolTxState {
  Pending = 1,
  Finalized = 9,
  Cancelled = 3,
}

export interface PoolTxRecord {
  txId: string
  poolId: string
  chainId: number
  type: PoolTxType
  createdAt: number
  txHash?: string
  state: PoolTxState
}
