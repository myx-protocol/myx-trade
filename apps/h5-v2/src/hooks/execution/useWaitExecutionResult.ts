import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useAccessParams } from '../useAccessParams'
import { ExecutionProgress, type OnExecutionResultCallback } from './Progress'
import { useCallback, useEffect, useRef } from 'react'

export interface useWaitExecutionResultProps {
  chainId: number
  poolId: string
  txId: string
  onExecutionResult: OnExecutionResultCallback
}

export const useWaitExecutionResult = () => {
  const { client } = useMyxSdkClient()
  const accessParams = useAccessParams()

  const progressListRef = useRef<ExecutionProgress[]>([])

  const waitExecutionResult = useCallback(
    ({ chainId, poolId, txId, onExecutionResult }: useWaitExecutionResultProps) => {
      const progress = new ExecutionProgress(
        async () => {
          if (!txId || !accessParams) return null
          const result = await client?.api.getTransactionOnline({
            ...accessParams,
            limit: 1,
            txId: txId,
            chainId,
            poolId,
            address: accessParams.account,
          })
          return result?.data[0]?.state ?? null
        },
        onExecutionResult,
        chainId,
        poolId,
        txId,
      )
      progress.start()
      progressListRef.current.push(progress)
      return progress
    },
    [client, accessParams],
  )

  useEffect(() => {
    return () => {
      progressListRef.current.forEach((progress) => {
        if (progress.isRunning) {
          progress.cancel()
        }
      })
      progressListRef.current = []
    }
  }, [])

  return { waitExecutionResult }
}
