import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'

interface UseBaseTokenInfoProps {
  chainId?: number
  poolId?: string
}

export const useBaseTokenInfo = ({ chainId, poolId }: UseBaseTokenInfoProps) => {
  const { client } = useMyxSdkClient()
  return useQuery({
    queryKey: ['baseTokenInfo', chainId, poolId],
    enabled: !!client && !!chainId && !!poolId,
    queryFn: async () => {
      if (!client || !chainId || !poolId) return null
      const baseTokenInfo = await client.markets.getBaseDetail({
        chainId,
        poolId,
      })
      return baseTokenInfo
    },
  })
}
