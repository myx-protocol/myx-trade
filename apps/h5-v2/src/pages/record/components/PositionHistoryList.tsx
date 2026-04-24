import { PositionHistoryItem } from '@/components/Record/Items/PositionHistoryItem'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Empty } from '@/components/Empty'
import { usePositionStore } from '@/store/position/createStore'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { useInfiniteScrollData, type InfiniteScrollGetData } from '@/hooks/useInfiniteScrollData'
import { useCallback } from 'react'
import type { PositionHistoryItem as PositionHistoryItemType } from '@myx-trade/sdk'
import { SuspenseLoading } from '@/components/Loading'
import { useUpdateEffect } from 'ahooks'

export const PositionHistoryList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { selectChainId } = usePositionStore()
  const getDataFunc: InfiniteScrollGetData<PositionHistoryItemType> = useCallback(
    async (pageParams) => {
      if (!client || !clientIsAuthenticated) return null
      const res = await client.position.getPositionHistory(
        {
          chainId: selectChainId === '0' ? 0 : parseInt(selectChainId),
          poolId: undefined,
          ...pageParams,
        },
        address ?? '',
      )
      return res.data
    },
    [client, clientIsAuthenticated, selectChainId, address],
  )
  const { data, isLoading, hasMore, getData, reset } = useInfiniteScrollData({
    getData: getDataFunc,
  })

  useUpdateEffect(() => {
    reset()
  }, [selectChainId])

  if (!isLoading && !data?.length && !hasMore) {
    return <Empty />
  }

  return (
    <>
      <InfiniteScrollView
        dataLength={data?.length}
        hasMore={hasMore}
        loadMore={getData}
        scrollableTarget={null}
      >
        {data?.map((item, index) => (
          <PositionHistoryItem key={index} item={item} />
        ))}
      </InfiniteScrollView>
      {Boolean(isLoading && !data?.length) && <SuspenseLoading block />}
    </>
  )
}
