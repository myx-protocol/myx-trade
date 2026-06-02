import { FinanceItem } from '@/components/Record/Items/Finance'
import { Empty } from '@/components/Empty'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { usePositionStore } from '@/store/position/createStore'
import { useInfiniteScrollData, type InfiniteScrollGetData } from '@/hooks/useInfiniteScrollData'
import { useCallback } from 'react'
import type { TradeFlowItem } from '@myx-trade/sdk'
import { useUpdateEffect } from 'ahooks'
import { SuspenseLoading } from '@/components/Loading'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
export const FinanceList = () => {
  const { client } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { selectChainId } = usePositionStore()
  const getDataFunc: InfiniteScrollGetData<TradeFlowItem> = useCallback(
    async (pageParams) => {
      if (!client) return null
      const res = await client.account.getTradeFlow(
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
        {data?.map((item, index) => (
          <FinanceItem key={index} item={item} />
        ))}
      </InfiniteScrollView>

      {Boolean(isLoading && !data?.length) && <SuspenseLoading block />}
    </>
  )
}
