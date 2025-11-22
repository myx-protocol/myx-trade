import type { SearchResultCookItem } from '@myx-trade/sdk'
import { SymbolInfo } from '../../SymbolInfo'
import { formatNumber } from '@/utils/number'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo } from 'react'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

interface CookListDataRowProps {
  item: SearchResultCookItem
  onItemClick: (item: SearchResultCookItem) => void
}

export const CookListDataRow = ({ item, onItemClick }: CookListDataRowProps) => {
  const chainInfo = useMemo(() => getChainInfo(item.chainId), [item.chainId])
  return (
    <div
      className="flex justify-between rounded-[6px] py-[12px] text-[#6D7180] hover:bg-[#202129]"
      role="button"
      onClick={() => onItemClick(item)}
    >
      <div className="w-[210px] items-center">
        <SymbolInfo
          isCook
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          symbolName={item.mBaseQuoteSymbol || item.symbolName}
          tokenAddress={item.baseToken}
          coinName={item.symbolName}
          baseSymbol={item.symbolName}
        />
      </div>
      <div className="flex w-[103px] flex-col items-end text-right text-[14px] font-medium text-white">
        <p>
          {formatNumber(item.lpPrice, {
            showUnit: false,
          })}
        </p>
        <p className="mt-[6px] text-[12px]">
          <RiseFallTextPrecent
            value={item.lpPriceChange}
            renderOptions={{
              decimals: 2,
              showSign: false,
            }}
          />
        </p>
      </div>
    </div>
  )
}
