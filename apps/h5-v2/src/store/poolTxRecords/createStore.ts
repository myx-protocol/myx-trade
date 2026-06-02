import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'
import type { PoolTxRecord } from './types'
import { PoolTxState, PoolTxType } from './types'

const MAX_TOTAL = 100
const STORAGE_KEY = 'zustand_PoolTxRecordsStore'

interface PoolTxRecordsState {
  records: PoolTxRecord[]
}

interface PoolTxRecordsActions {
  addRecord: (params: {
    poolId: string
    chainId: number
    type: PoolTxType
    txId: string
    txHash?: string
  }) => void
}

type PoolTxRecordsStore = PoolTxRecordsState & PoolTxRecordsActions

export const usePoolTxRecordsStore = createWithEqualityFn<PoolTxRecordsStore>()(
  devtools(
    persist(
      immer((set) => ({
        records: [],

        addRecord: ({ poolId, chainId, type, txId, txHash }) => {
          set((s) => {
            const newRecord: PoolTxRecord = {
              txId,
              poolId,
              chainId,
              type,
              createdAt: Date.now(),
              txHash,
              state: PoolTxState.Pending,
            }

            s.records.push(newRecord)

            if (s.records.length > MAX_TOTAL) {
              s.records.shift()
            }
          })
        },
      })),
      {
        name: STORAGE_KEY,
      },
    ),
    { name: 'PoolTxRecords' },
  ),
  shallow,
)
