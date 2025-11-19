import type { TransactionDetails } from './types'

export type CurrentChainTransactionState = {
  [txHash: string]: TransactionDetails
}

export interface TransactionsState {
  transactions: {
    [account: string]: {
      [chainId: number]: CurrentChainTransactionState
    }
  }
}

export const initialState: TransactionsState = {
  transactions: {},
}
