import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { formatNumber } from '@/utils/number'
import { SymbolInfo } from '../../SymbolInfo'
import type { SearchResultEarnItem } from '@myx-trade/sdk'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo } from 'react'

interface EarnListDataRowProps {
  item: SearchResultEarnItem
  onItemClick: (item: SearchResultEarnItem) => void
}

export const EarnListDataRow = ({ item, onItemClick }: EarnListDataRowProps) => {
  const chainInfo = useMemo(() => getChainInfo(item.chainId), [item.chainId])
  return (
    <div
      className="flex justify-between rounded-[6px] py-[12px] text-[#6D7180] hover:bg-[#202129]"
      role="button"
      onClick={() => onItemClick(item)}
    >
      <div className="w-[210px] items-center">
        <SymbolInfo
          symbolName={item.mQuoteBaseSymbol || item.symbolName}
          coinName={item.symbolName}
          tokenAddress={item.baseToken}
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          baseSymbol={item.symbolName}
          marketStatus={item.state}
          showMarketStatus
        />
      </div>
      <div className="flex w-[103px] items-center justify-end text-[14px] font-medium text-white">
        <RiseFallTextPrecent
          value={item.apr}
          renderOptions={{
            decimals: 2,
            showSign: false,
          }}
        />
      </div>
    </div>
  )
}
