import { MarketType, type SearchResultContractItem } from '@myx-trade/sdk'
import { SymbolInfo } from '../../SymbolInfo'
import { MarketCapType } from '@myx-trade/sdk'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { formatNumber } from '@/utils/number'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo, useRef } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useWalletStore } from '@/store/wallet/createStore'
import { tradePubSub } from '@/utils/pubsub'
import { useMount } from 'ahooks'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { Price } from '@/components/Price'

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

  useMount(() => {
    console.log('mounted-item', item.poolId)
  })

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
        .removeFavorite({
          chainId: item.chainId,
          poolId: item.poolId,
        })
        .then(() => {
          tradePubSub.emit('global:search:update')
        })
        .finally(() => {
          isLoadingRef.current = false
        })
    } else {
      client?.markets
        .addFavorite({
          chainId: item.chainId,
          poolId: item.poolId,
        })
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
      className="flex justify-between gap-[64.67px] rounded-[6px] px-[12px] py-[12px] leading-[1] text-[#6D7180] hover:bg-[#202129]"
      role="button"
      onClick={() => onItemClick(item)}
    >
      <div className="w-[210px] items-center">
        <SymbolInfo
          showFavoriteIcon={item.type === MarketType.Contract}
          isFavorite={item.favorites === 1}
          isBluechip={item.capType === MarketCapType.BlueChips}
          isCook={item.type === MarketType.Cook}
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          symbolName={item.baseQuoteSymbol || item.symbolName}
          coinName={item.symbolName}
          onFavoriteChange={handleFavoriteChange}
          tokenAddress={item.baseToken}
          baseSymbol={item.symbolName}
        />
      </div>
      <div className="flex w-[105px] items-center justify-end text-[14px] font-medium text-white">
        <div className="flex flex-col items-end gap-[6px]">
          <span>{formatNumber(item.tvl)}</span>
          <span className="text-[12px] leading-[1] text-[#848E9C]">
            {formatNumber(item.marketCap)}
          </span>
        </div>
      </div>
      <div className="flex w-[103px] flex-col items-center items-end text-right text-[14px] font-medium text-white">
        <p>
          <Price value={tickerData?.price || item.basePrice} showUnit={false} decimals={2} />
        </p>
        <p className="mt-[6px] text-[12px]">
          <RiseFallTextPrecent value={tickerData?.change || item.priceChange} />
        </p>
      </div>
    </div>
  )
}
