import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { SearchSecondTypeEnum, SearchTypeEnum } from '@myx-trade/sdk'

export const useFavoritesDefault = () => {
  const { client } = useMyxSdkClient()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favorites-default'],
    enabled: !!client,
    queryFn: async () => {
      const res = await client?.markets.searchMarket({
        searchKey: '',
        searchType: SearchTypeEnum.Contract,
        type: SearchSecondTypeEnum.Favorite,
        chainId: 0,
      })

      return res
    },
    select: (res) => res?.contractInfo.favorites || [],
  })

  return {
    data,
    isLoading,
    refetch,
  }
}
