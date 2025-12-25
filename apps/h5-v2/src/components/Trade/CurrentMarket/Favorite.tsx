import Star from '@/components/Icon/set/Star'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { appPubSub } from '@/utils/pubsub'
import { useMount, useUnmount } from 'ahooks'
import useGlobalStore from '@/store/globalStore'

export const Favorite = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useGlobalStore()

  const { address, isConnected, setLoginModalOpen } = useWalletConnection()
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const { refetch } = useQuery({
    queryKey: ['favorite', symbolInfo?.poolId, symbolInfo?.chainId, address, clientIsAuthenticated],
    enabled: Boolean(
      isConnected && address && symbolInfo?.poolId && symbolInfo.chainId && clientIsAuthenticated,
    ),
    queryFn: async () => {
      if (!symbolInfo?.poolId || !symbolInfo.chainId || !client || !clientIsAuthenticated)
        return null
      const favorite = await client.markets.getFavoritesList(
        {
          poolId: symbolInfo.poolId,
          chainId: symbolInfo.chainId,
        },
        address ?? '',
      )
      setIsFavorite(favorite?.[0]?.favorites === 1)
      return favorite?.[0]
    },
    refetchOnWindowFocus: false,
    retry: false,
  })

  const onAppAuthenticated = () => {
    refetch()
  }
  useMount(() => {
    appPubSub.on('app:sdk:authenticated', onAppAuthenticated)
  })

  useUnmount(() => {
    appPubSub.off('app:sdk:authenticated', onAppAuthenticated)
  })

  const isLoadingRef = useRef<boolean>(false)
  const handleFavoriteClick = () => {
    if (!isConnected || !address) {
      return setLoginModalOpen(true)
    }
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    if (!symbolInfo?.poolId || !symbolInfo.chainId) return
    const valueOrigin = isFavorite
    setIsFavorite(!valueOrigin)
    if (isFavorite) {
      client?.markets
        .removeFavorite(
          {
            poolId: symbolInfo.poolId,
            chainId: symbolInfo.chainId,
          },
          address ?? '',
        )
        .catch(() => {
          setIsFavorite(valueOrigin)
        })
        .then(() => refetch())
        .finally(() => {
          isLoadingRef.current = false
        })
    } else {
      client?.markets
        .addFavorite(
          {
            poolId: symbolInfo.poolId,
            chainId: symbolInfo.chainId,
          },
          address ?? '',
        )
        .catch(() => {
          setIsFavorite(valueOrigin)
        })
        .then(() => refetch())
        .finally(() => {
          isLoadingRef.current = false
        })
    }
  }
  return (
    <div
      className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[6px] border-1 border-[#31333D]"
      role="button"
      onClick={handleFavoriteClick}
    >
      <Star size={12} color={isFavorite ? '#ffca40' : '#6D7180'} />
    </div>
  )
}
