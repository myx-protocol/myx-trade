import Star from '@/components/Icon/set/Star'
import { PairLogo } from '@/components/UI/PairLogo'
import { truncateAddress } from '@/utils/string'
import { t } from '@lingui/core/macro'
import { useMemo, type MouseEventHandler } from 'react'
import { Copy } from '@/components/Copy'
import { MarketPoolState } from '@myx-trade/sdk'
import { Tooltips } from '@/components/UI/Tooltips'

import {
  MarketCreate,
  MarketReady,
  MarketTrading,
  MarketPreDelisted,
  MarketDelisted,
} from '@/components/Icon'

export interface SymbolInfoProps {
  symbolName?: string
  coinName?: string
  tokenAddress?: string
  baseTokenLogo?: string
  quoteTokenLogo?: string
  showFavoriteIcon?: boolean
  isFavorite?: boolean
  onFavoriteChange?: () => void
  baseSymbol?: string
  quoteSymbol?: string
  showMarketStatus?: boolean
  marketStatus?: MarketPoolState
}

export const SymbolInfo = ({
  symbolName = '--',
  coinName = '--',
  tokenAddress = '--',
  baseTokenLogo,
  quoteTokenLogo,
  showFavoriteIcon,
  isFavorite = false,
  onFavoriteChange,
  baseSymbol,
  quoteSymbol,
  showMarketStatus = false,
  marketStatus,
}: SymbolInfoProps) => {
  const handleBeforeFavoriteChange: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (onFavoriteChange) {
      onFavoriteChange()
    }
  }

  const MarketStatusIcon = useMemo(() => {
    if (showMarketStatus) {
      switch (marketStatus) {
        case MarketPoolState.Cook:
          return (
            <Tooltips
              title={t`Cooking : Gathering initial liquidity. Become a "Genesis LP" now for a permanent 2% fee share.`}
            >
              <MarketCreate size={12} />
            </Tooltips>
          )
        case MarketPoolState.Primed:
          return (
            <Tooltips
              title={t`Pending : Activation Oracle deployment in progress. Trading will begin soon.`}
            >
              <MarketReady size={12} />
            </Tooltips>
          )
        case MarketPoolState.Trench:
          return (
            <Tooltips title={t`Trading : Market is live. Trading is open and generating earnings.`}>
              <MarketTrading size={12} />
            </Tooltips>
          )
        case MarketPoolState.PreBench:
          return (
            <Tooltips
              title={t`Pending Delisting:Scheduled for closure soon. Operations are stopping.`}
            >
              <MarketPreDelisted size={12} />
            </Tooltips>
          )
        case MarketPoolState.Bench:
          return (
            <Tooltips title={t`Delisted : Market is closed. Only asset redemption is available.`}>
              <MarketDelisted size={12} />
            </Tooltips>
          )
      }
    }
    return null
  }, [showMarketStatus, marketStatus])
  return (
    <div className="flex items-center gap-[8px] leading-[1]">
      {/* star */}
      {showFavoriteIcon && (
        <div
          className="flex h-[18px] w-[18px] cursor-pointer select-none"
          onClick={handleBeforeFavoriteChange}
        >
          <Star size={18} color={isFavorite ? '#ffca40' : '#6D7180'} />
        </div>
      )}
      {/* symbol info */}
      <div className="flex items-center gap-[4px]">
        <PairLogo
          baseLogo={baseTokenLogo}
          quoteLogo={quoteTokenLogo}
          baseSymbol={baseSymbol}
          quoteSymbol={quoteSymbol}
          baseLogoSize={24}
          quoteLogoSize={8}
        />
        <div>
          {/* symbol name */}
          <div className="flex items-center gap-[4px]">
            <p className="line-clamp-1 text-[14px] font-medium text-white">{symbolName}</p>
            {showMarketStatus && (
              <div className="ml-[4px] flex shrink-0 items-center">{MarketStatusIcon}</div>
            )}
          </div>
          {/* info */}
          <div className="text-normal mt-[2px] flex items-center gap-[8px] text-[12px] text-[#848E9C]">
            <p className="line-clamp-1 leading-[1.2]">{coinName}</p>
            <div className="flex items-center gap-[4px]">
              <p>{truncateAddress(tokenAddress || '--', 6, 4)}</p>
              <Copy className="" content={tokenAddress}></Copy>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
