import { useMemo, type ReactNode } from 'react'
import { PairLogo } from '../UI/PairLogo'
import { getChainInfo } from '@/config/chainInfo'
import clsx from 'clsx'

interface SymbolInfoProps {
  symbol: string
  baseTokenLogo?: string
  chainId?: number
  className?: string
  descriptionText?: ReactNode
}

export const SymbolInfo = ({
  symbol,
  baseTokenLogo,
  chainId,
  className,
  descriptionText,
}: SymbolInfoProps) => {
  const chainInfo = useMemo(() => {
    if (!chainId) return null
    return getChainInfo(chainId)
  }, [chainId])
  return (
    <div className={clsx('flex items-center justify-start gap-[8px]', className)}>
      <PairLogo
        baseLogoSize={24}
        quoteLogoSize={10}
        baseLogo={baseTokenLogo}
        quoteLogo={chainInfo?.logoUrl}
        baseSymbol={symbol}
      />
      <div className="flex flex-col items-center justify-start gap-[2px]">
        <p className="text-[14px] font-medium text-white">{symbol}</p>
        {descriptionText && (
          <div className="text-[12px] leading-[1.2] font-normal text-[#848E9C]">
            {descriptionText}
          </div>
        )}
      </div>
    </div>
  )
}
