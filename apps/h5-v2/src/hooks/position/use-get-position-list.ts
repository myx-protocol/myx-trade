import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { usePositionStore } from '@/store/position/createStore'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import useSWR from 'swr'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'

export const useGetPositionList = (filter: boolean = false) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address, isWrongNetwork } = useWalletConnection()
  const { hideOthersSymbols, selectChainId } = usePositionStore()
  const { symbolInfo } = useTradePageStore()
  const { tickerData } = useMarketStore()
  const { poolList } = useGetPoolList()
  const { subscribeToTicker } = useSubscription()

  const { data, mutate } = useSWR(
    address && client && symbolInfo?.poolId && clientIsAuthenticated && !isWrongNetwork
      ? {
          key: 'get_position_list',
          address,
          poolId: symbolInfo?.poolId,
          hideOthersSymbols,
          clientIsAuthenticated,
          isWrongNetwork,
          selectChainId,
          filter,
        }
      : null,
    async () => {
      const rs: any = await client?.position.listPositions()
      const positions = rs?.data ?? []

      poolList.forEach((item: any) => {
        if (tickerData[item.poolId]) {
          return
        }

        const globalId = poolList.find((pool: any) => pool.poolId === item.poolId)?.globalId
        subscribeToTicker({
          poolId: item.poolId,
          globalId: globalId,
        })
      })

      if (!filter) {
        return positions
      }

      const filteredPositions = positions.filter((item: any) =>
        hideOthersSymbols ? item.poolId === symbolInfo?.poolId : true,
      )

      const positionByChainId = filteredPositions.filter((item: any) => {
        return item.chainId === Number(selectChainId) || selectChainId === '0'
      })
      return positionByChainId ?? []
      // return positions ?? []
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
