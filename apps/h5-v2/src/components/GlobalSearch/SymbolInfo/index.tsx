import Star from '@/components/Icon/set/Star'
import Cook from '@/components/Icon/set/Cook'
import { PairLogo } from '@/components/UI/PairLogo'
import { truncateAddress } from '@/utils/string'
import { t } from '@lingui/core/macro'
import type { MouseEventHandler } from 'react'
import { Copy } from '@/components/Copy'

export interface SymbolInfoProps {
  symbolName?: string
  coinName?: string
  tokenAddress?: string
  baseTokenLogo?: string
  quoteTokenLogo?: string
  isBluechip?: boolean
  isCook?: boolean
  showFavoriteIcon?: boolean
  isFavorite?: boolean
  onFavoriteChange?: () => void
  baseSymbol?: string
  quoteSymbol?: string
}

export const SymbolInfo = ({
  symbolName = '--',
  coinName = '--',
  tokenAddress = '--',
  baseTokenLogo,
  quoteTokenLogo,
  showFavoriteIcon,
  isFavorite = false,
  isBluechip,
  isCook,
  onFavoriteChange,
  baseSymbol,
  quoteSymbol,
}: SymbolInfoProps) => {
  const handleBeforeFavoriteChange: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (onFavoriteChange) {
      onFavoriteChange()
    }
  }
  return (
    <div className="flex items-center gap-[12px] leading-[1]">
      {/* star */}
      {showFavoriteIcon && (
        <div
          className="flex h-[18px] w-[18px] cursor-pointer select-none"
          onClick={handleBeforeFavoriteChange}
        >
          <Star size={18} color={isFavorite ? '#00E3A5' : '#6D7180'} />
        </div>
      )}
      {/* symbol info */}
      <div className="flex items-center gap-[4px]">
        <PairLogo
          baseLogo={baseTokenLogo}
          quoteLogo={quoteTokenLogo}
          baseSymbol={baseSymbol}
          quoteSymbol={quoteSymbol}
        />
        <div>
          {/* symbol name */}
          <div className="flex items-center gap-[4px]">
            <p className="line-clamp-1 text-[14px] font-medium text-white">{symbolName}</p>
            {/* bluechip */}
            {isBluechip && (
              <div className="rounded rounded-[4px] bg-[rgba(0,227,165,0.1)] px-[4px] py-[3px] text-[10px] leading-[1] text-[#00E3A5]">{t`蓝筹`}</div>
            )}
            {/* cook */}
            {isCook && (
              <div className="flex items-center">
                <Cook size={12} color="#00E3A5" />
              </div>
            )}
          </div>
          {/* info */}
          <div className="text-normal mt-[2px] flex items-center gap-[8px] text-[12px] text-[#848E9C]">
            <p className="line-clamp-1 leading-[1.2]">{coinName}</p>
            <div className="flex items-center gap-[4px]">
              <p>{truncateAddress(tokenAddress || '--')}</p>
              <Copy className="" content={tokenAddress}></Copy>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
