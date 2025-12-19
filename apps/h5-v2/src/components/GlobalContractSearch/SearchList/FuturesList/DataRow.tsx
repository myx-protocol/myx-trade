import { type SearchResultContractItem } from '@myx-trade/sdk'
import { SymbolInfo } from '../../SymbolInfo'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo, useRef } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useWalletStore } from '@/store/wallet/createStore'
import { tradePubSub } from '@/utils/pubsub'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { Price } from '@/components/Price'
import { Favorite } from '../../SymbolInfo/Favorite'

interface FuturesListDataRowProps {
  item: SearchResultContractItem
  onItemClick: (item: SearchResultContractItem) => void
}

export const FuturesListDataRow = ({ item, onItemClick }: FuturesListDataRowProps) => {
  const chainInfo = useMemo(() => getChainInfo(item.chainId), [item.chainId])
  const { client } = useMyxSdkClient()
  const { isWalletConnected } = useWalletConnection()
  const { setLoginModalOpen } = useWalletStore()
  const tickerData = useMarketStore((state) => state.tickerData[item.poolId])
  const { address } = useWalletConnection()

  const isLoadingRef = useRef<boolean>(false)

  const handleFavoriteChange = () => {
    if (!isWalletConnected) {
      setLoginModalOpen(true)
      return
    }

    if (isLoadingRef.current) return
    isLoadingRef.current = true
    const isFavorite = item.favorites === 1
    if (isFavorite) {
      client?.markets
        .removeFavorite(
          {
            chainId: item.chainId,
            poolId: item.poolId,
          },
          address ?? '',
        )
        .then(() => {
          tradePubSub.emit('global:search:update')
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    } else {
      client?.markets
        .addFavorite(
          {
            chainId: item.chainId,
            poolId: item.poolId,
          },
          address ?? '',
        )
        .then(() => {
          tradePubSub.emit('global:search:update')
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    }
  }
  return (
    <div
      className="flex justify-between gap-[24px] rounded-[6px] py-[12px] text-[#6D7180] hover:bg-[#202129]"
      role="button"
      onClick={() => onItemClick(item)}
    >
      <div className="w-[107px] items-center">
        <SymbolInfo
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          onFavoriteChange={handleFavoriteChange}
          baseSymbol={item.baseSymbol || '-'}
          quoteSymbol={item.quoteSymbol || '-'}
          volume={tickerData?.volume || item.volume}
        />
      </div>
      <div className="flex flex-[1_1_0%] items-center gap-[20px]">
        <div className="flex flex-[1_1_0%] flex-col items-end text-right text-[14px] font-medium text-white">
          <p>
            <Price value={tickerData?.price || item.basePrice} showUnit={false} decimals={2} />
          </p>
          <p className="mt-[6px] text-[12px]">
            <RiseFallTextPrecent value={tickerData?.change || item.priceChange} />
          </p>
        </div>
        <Favorite isFavorite={item.favorites === 1} onFavoriteChange={handleFavoriteChange} />
      </div>
    </div>
  )
}
