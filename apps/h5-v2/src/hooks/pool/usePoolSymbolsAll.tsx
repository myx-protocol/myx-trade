import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { type PoolSymbolAllResponse } from '@myx-trade/sdk'

export const usePoolSymbolsAll = () => {
  const { client } = useMyxSdkClient()
  const {
    data: symbolDataAll,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pool-symbols-all'],
    enabled: !!client,
    queryFn: () => client?.markets.getPoolSymbolAll(),
    refetchOnWindowFocus: false,
  })

  const symbolDataAllMap = useMemo(() => {
    const sumbolDataAllMap: Record<number, Record<string, PoolSymbolAllResponse>> = {}
    if (symbolDataAll?.length) {
      symbolDataAll?.forEach((item) => {
        if (!sumbolDataAllMap[item.chainId]) {
          sumbolDataAllMap[item.chainId] = {}
        }
        sumbolDataAllMap[item.chainId][item.poolId] = item
      })
    }
    return sumbolDataAllMap
  }, [symbolDataAll])

  return { symbolDataAll, symbolDataAllMap, isLoading, error }
}
