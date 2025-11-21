import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { usePositionStore } from '@/store/position/createStore'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import useSWR from 'swr'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'

export const useGetPositionList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address, isWrongNetwork } = useWalletConnection()
  const { hideOthersSymbols } = usePositionStore()
  const { symbolInfo } = useTradePageStore()

  const { data, mutate } = useSWR(
    address && client && symbolInfo?.poolId && clientIsAuthenticated && !isWrongNetwork
      ? {
          key: 'get_position_list',
          address,
          poolId: symbolInfo?.poolId,
          hideOthersSymbols,
          clientIsAuthenticated,
          isWrongNetwork,
        }
      : null,
    async () => {
      const rs: any = await client?.position.listPositions()

      const filteredPositions = rs?.data?.filter((item: any) =>
        hideOthersSymbols ? item.poolId === symbolInfo?.poolId : true,
      )

      return filteredPositions ?? []
    },
    {
      refreshInterval: 10000,
    },
  )

  useEffect(() => {
    const onRefresh = () => {
      mutate()
    }
    tradePubSub.on('place:order:success', onRefresh)
    return () => {
      tradePubSub.off('place:order:success', onRefresh)
    }
  }, [])

  return data ?? []
}
