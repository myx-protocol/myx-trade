import { Empty } from '@/components/Empty'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { OrderHistoryItem } from '@/components/Record/Items/OrderHistory'
import { useInfiniteScrollData, type InfiniteScrollGetData } from '@/hooks/useInfiniteScrollData'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { usePositionStore } from '@/store/position/createStore'
import type { HistoryOrderItem } from '@myx-trade/sdk'
import { useCallback } from 'react'
import { SuspenseLoading } from '@/components/Loading'
import { useUpdateEffect } from 'ahooks'

export const OrderHistoryList = () => {
  const { client } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { selectChainId } = usePositionStore()
  const getDataFunc: InfiniteScrollGetData<HistoryOrderItem> = useCallback(
    async (pageParams) => {
      if (!client) return null
      console.log('getOrderHistory', pageParams)
      const res = await client.order.getOrderHistory(
        {
          chainId: selectChainId === '0' ? 0 : parseInt(selectChainId),
          poolId: undefined,
          ...pageParams,
        },
        address ?? '',
      )
      return res.data
    },
    [client, selectChainId, address],
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
        {data?.map((item) => (
          <OrderHistoryItem key={item.orderId} item={item} />
        ))}
      </InfiniteScrollView>
      {Boolean(isLoading && !data?.length) && <SuspenseLoading block />}
    </>
  )
}
