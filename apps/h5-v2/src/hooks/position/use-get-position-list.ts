import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { usePositionStore } from '@/store/position/createStore'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import useSWR from 'swr'

export const useGetPositionList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { hideOthersSymbols } = usePositionStore()
  const { symbolInfo } = useTradePageStore()

  const { data } = useSWR(
    address && client && symbolInfo?.poolId && clientIsAuthenticated
      ? {
          key: 'get_position_list',
          address,
          poolId: symbolInfo?.poolId,
          hideOthersSymbols,
          clientIsAuthenticated,
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

  return data ?? []
}
