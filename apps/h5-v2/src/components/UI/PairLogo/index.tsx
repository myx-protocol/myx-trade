import clsx from 'clsx'
import { CoinIcon } from '../CoinIcon'

interface PairLogoProps {
  baseLogo?: string
  quoteLogo?: string
  baseLogoSize?: number
  quoteLogoSize?: number
  baseSymbol?: string
  quoteSymbol?: string
  quoteClassName?: string
  baseClassName?: string
}

export const PairLogo = ({
  baseSymbol,
  quoteSymbol,
  baseLogo,
  quoteLogo,
  baseLogoSize = 24,
  quoteLogoSize = 12,
  quoteClassName,
  baseClassName,
}: PairLogoProps) => {
  return (
    <div className="flex items-end justify-center">
      <CoinIcon
        icon={baseLogo || ''}
        size={baseLogoSize}
        className={clsx(`z-[1]`, baseClassName)}
        symbol={baseSymbol}
      />
      <CoinIcon
        icon={quoteLogo || ''}
        className={clsx(`z-[2]`, quoteClassName)}
        size={quoteLogoSize}
        style={{ marginLeft: `-${quoteLogoSize / 2}px` }}
        symbol={quoteSymbol}
      />
    </div>
  )
}
