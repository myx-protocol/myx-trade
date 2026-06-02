import { MarketType, type SearchResultContractItem } from '@myx-trade/sdk'
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
import { useUpdateEffect } from 'ahooks'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface FuturesListDataRowProps {
  item: SearchResultContractItem
  onItemClick: (item: SearchResultContractItem) => void
  isLightMode?: boolean
}

export const FuturesListDataRow = ({
  isLightMode = false,
  item,
  onItemClick,
}: FuturesListDataRowProps) => {
  const chainInfo = useMemo(() => getChainInfo(item.chainId), [item.chainId])
  const { client } = useMyxSdkClient()
  const { isWalletConnected, address } = useWalletConnection()
  const { setLoginModalOpen } = useWalletStore()
  const tickerData = useMarketStore((state) => state.tickerData[item.poolId])

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
        .removeFavorite({ chainId: item.chainId, poolId: item.poolId }, address ?? '')
        .then(() => {
          tradePubSub.emit('global:search:update')
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    } else {
      client?.markets
        .addFavorite({ chainId: item.chainId, poolId: item.poolId }, address ?? '')
        .then(() => {
          tradePubSub.emit('global:search:update')
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    }
  }

  const rootRef = useRef<HTMLDivElement>(null)
  useUpdateEffect(() => {
    if (isLightMode) {
      rootRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLightMode])

  return (
    <div
      ref={rootRef}
      className={twMerge(
        clsx(
          'flex justify-between rounded-[6px] border border-transparent py-[12px] text-[#6D7180] hover:bg-[#202129]',
          {
            'border-green/30': isLightMode,
          },
        ),
      )}
      role="button"
      onClick={() => onItemClick(item)}
    >
      <div className="w-[210px] items-center">
        <SymbolInfo
          showFavoriteIcon={item.type === MarketType.Contract}
          isFavorite={item.favorites === 1}
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          symbolName={item.baseQuoteSymbol || item.symbolName}
          coinName={item.symbolName}
          onFavoriteChange={handleFavoriteChange}
          tokenAddress={item.baseToken}
          baseSymbol={item.symbolName}
        />
      </div>
      <div className="flex w-[103px] flex-col items-end text-right text-[14px] font-medium text-white">
        <p>
          <Price value={tickerData?.price || item.basePrice} showUnit={false} />
        </p>
        <p className="mt-[6px] text-[12px]">
          <RiseFallTextPrecent value={tickerData?.change || item.priceChange} />
        </p>
      </div>
    </div>
  )
}
