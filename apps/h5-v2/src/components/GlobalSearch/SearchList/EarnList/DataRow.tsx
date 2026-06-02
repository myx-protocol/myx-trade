import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { SymbolInfo } from '../../SymbolInfo'
import type { SearchResultEarnItem } from '@myx-trade/sdk'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo, useRef } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useUpdateEffect } from 'ahooks'

interface EarnListDataRowProps {
  item: SearchResultEarnItem
  onItemClick: (item: SearchResultEarnItem) => void
  isLightMode?: boolean
}

export const EarnListDataRow = ({
  isLightMode = false,
  item,
  onItemClick,
}: EarnListDataRowProps) => {
  const chainInfo = useMemo(() => getChainInfo(item.chainId), [item.chainId])

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
            showSign: false,
          }}
        />
      </div>
    </div>
  )
}
