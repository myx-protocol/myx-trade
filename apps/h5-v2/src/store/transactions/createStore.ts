import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'
import { initialState } from './initialState'
import { TransactionReceiptStatus, TransactionState } from './types'
import type { TransactionReceipt } from '@ethersproject/providers'
import type { TransactionInfo } from './types'
import type { TransactionsState } from './initialState'

interface Action {
  addTransaction: (data: {
    chainId: number
    hash: string
    from: string
    state?: TransactionState
    info: TransactionInfo
  }) => void
  finalizeTransaction: (tx: {
    chainId: number
    hash: string
    from: string
    receipt: TransactionReceipt
  }) => void
  removeTransaction: (tx: { chainId: number; hash: string; from: string }) => void
  wrongTransaction: (tx: {
    chainId: number
    hash: string
    from: string
    state: TransactionState
  }) => void
}

type BaseTransactionsStoreType = TransactionsState & Action

export const useTransactionsStore = createWithEqualityFn<BaseTransactionsStoreType>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            ...initialState,
            addTransaction: ({ chainId, hash, from, info }) => {
              set((s) => {
                const transactions = s.transactions

                if (transactions[from]?.[chainId]?.[hash]) {
                  throw new Error('Attempted to add existing transaction.')
                }

                const tx = {
                  state: TransactionState.PENDING,
                  hash,
                  from,
                  addedTime: Date.now(),
                  info,
                }
                if (!s.transactions[from]) {
                  s.transactions[from] = { [chainId]: { [hash]: tx } }
                } else if (!s.transactions[from][chainId]) {
                  s.transactions[from][chainId] = { [hash]: tx }
                } else {
                  s.transactions[from][chainId][hash] = tx
                }
              })
            },

            finalizeTransaction: ({ chainId, hash, from, receipt }) => {
              set((s) => {
                const transactions = s.transactions
                const tx = transactions[from]?.[chainId]?.[hash]
                if (tx) {
                  tx.confirmedTime = Date.now()
                  tx.state =
                    receipt.status === TransactionReceiptStatus.SUCCESS
                      ? TransactionState.Finalized
                      : TransactionState.WRONG
                }
              })
            },

            wrongTransaction: ({ chainId, hash, from, state }) => {
              set((s) => {
                const transactions = s.transactions
                const tx = transactions[from]?.[chainId]?.[hash]
                if (tx) {
                  tx.confirmedTime = Date.now()
                  tx.state = state
                }
              })
            },

            removeTransaction: ({ chainId, hash, from }) => {
              set((s) => {
                if (s.transactions[from]?.[chainId][hash]) {
                  delete s.transactions[from][chainId][hash]
                }
              })
            },
          }) as BaseTransactionsStoreType,
      ),
      {
        name: 'zustand_TransactionsStore',
      },
    ),
    { name: 'Transactions' },
  ),
  shallow,
)
