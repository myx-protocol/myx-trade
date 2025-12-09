import { SortDown, ArrowLeftLong, Star } from '@/components/Icon'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { truncateString } from '@/utils/string'
import { useNavigate } from 'react-router-dom'
import { usePriceStore } from '../store'
import { useBaseTokenInfo } from '@/components/Trade/hooks/useBaseTokenInfo'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useRef, useState } from 'react'
import { useMount, useUnmount } from 'ahooks'
import { appPubSub } from '@/utils/pubsub'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'

export const Header = () => {
  const navigate = useNavigate()
  const { symbolInfo } = usePriceStore()
  const { data: baseTokenInfo } = useBaseTokenInfo({
    chainId: symbolInfo?.chainId,
    poolId: symbolInfo?.poolId,
  })
  const { isWalletConnected, address: walletAddress } = useWalletConnection()
  const { client, clientIsAuthenticated } = useMyxSdkClient()

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
      const favorite = await client.markets.getFavoritesList({
        poolId: symbolInfo.poolId,
        chainId: symbolInfo.chainId,
      })
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
        .removeFavorite({
          poolId: symbolInfo.poolId,
          chainId: symbolInfo.chainId,
        })
        .catch(() => {
          setIsFavorite(valueOrigin)
        })
        .then(() => refetch())
        .finally(() => {
          isLoadingRef.current = false
        })
    } else {
      client?.markets
        .addFavorite({
          poolId: symbolInfo.poolId,
          chainId: symbolInfo.chainId,
        })
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
    <div className="bg-deep sticky top-0 z-20 flex h-auto shrink-0 items-center justify-between px-[16px] pt-[16px] pb-[12px]">
      <div className="flex items-center gap-[12px] text-white">
        <span
          role="button"
          className="flex"
          onClick={() => {
            navigate(-1)
          }}
        >
          <ArrowLeftLong size={20} />
        </span>

        <div className="flex items-center gap-[4px]" role="button">
          <p className="text-[16px] font-bold">
            {`${symbolInfo?.baseSymbol || '--'}${symbolInfo?.quoteSymbol || ''}`}
          </p>
          <span>
            <SortDown size={8} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        <span role="button" className="flex" onClick={handleFavoriteClick}>
          <Star color={isFavorite ? '#00E3A5' : '#6D7180'} size={18} />
        </span>
        <div className="flex items-center">
          {/* <CoinIcon size={20} icon={baseTokenInfo?.tokenIcon} /> */}
          <div className="ml-[4px] flex items-center gap-[2px]" role="button">
            <p className="text-[14px] font-medium">
              {isWalletConnected ? truncateString(walletAddress || '', 2, 4, '..') : '--'}
            </p>
            <span>
              <SortDown size={8} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
