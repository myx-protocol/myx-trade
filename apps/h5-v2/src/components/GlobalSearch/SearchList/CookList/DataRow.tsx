import type { SearchResultCookItem } from '@myx-trade/sdk'
import { MarketPoolState } from '@myx-trade/sdk'
import { SymbolInfo } from '../../SymbolInfo'
import { formatNumber } from '@/utils/number'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { getChainInfo } from '@/config/chainInfo'
import { useMemo, useRef } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useUpdateEffect } from 'ahooks'
import { LinearProgress } from '@mui/material'

interface CookListDataRowProps {
  item: SearchResultCookItem & { progress?: string }
  onItemClick: (item: SearchResultCookItem) => void
  isLightMode?: boolean
  variant?: 'cook' | 'base_vault'
}

export const CookListDataRow = ({
  isLightMode = false,
  item,
  onItemClick,
  variant = 'base_vault',
}: CookListDataRowProps) => {
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
          baseTokenLogo={item.tokenIcon}
          quoteTokenLogo={chainInfo?.logoUrl}
          symbolName={
            variant === 'cook'
              ? `${item.baseSymbol}${item.quoteSymbol}`
              : item.mBaseQuoteSymbol || item.symbolName
          }
          tokenAddress={item.baseToken}
          coinName={item.symbolName}
          baseSymbol={item.symbolName}
          marketStatus={item.state}
          showMarketStatus
        />
      </div>
      <div className="flex w-[103px] flex-col items-end justify-center text-right text-[14px] font-medium text-white">
        {variant === 'cook' ? (
          item.state === MarketPoolState.Bench ? (
            <span className="text-[12px] text-[#6D7180]">--</span>
          ) : (
            <div className="flex w-full items-center gap-[8px]">
              <LinearProgress
                variant="determinate"
                value={Math.min(Number(item.progress ?? 0), 100)}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 9999,
                  backgroundColor: '#2B2D3A',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#00E3A5',
                    borderRadius: 9999,
                  },
                }}
              />
              <span className="text-[12px] text-white">
                {item.progress != null
                  ? `${Math.min(Math.floor(Number(item.progress)), 100)}%`
                  : '--'}
              </span>
            </div>
          )
        ) : (
          <>
            <p>
              {formatNumber(item.lpPrice, {
                showUnit: false,
              })}
            </p>
            <p className="mt-[6px] text-[12px]">
              <RiseFallTextPrecent value={item.lpPriceChange} renderOptions={{ showSign: false }} />
            </p>
          </>
        )}
      </div>
    </div>
  )
}
