import { CoinIcon } from '../CoinIcon'

interface PairLogoProps {
  baseLogo?: string
  quoteLogo?: string
  baseLogoSize?: number
  quoteLogoSize?: number
  baseSymbol?: string
  quoteSymbol?: string
}

export const PairLogo = ({
  baseSymbol,
  quoteSymbol,
  baseLogo,
  quoteLogo,
  baseLogoSize = 24,
  quoteLogoSize = 12,
}: PairLogoProps) => {
  return (
    <div className="flex items-end justify-center">
      <CoinIcon icon={baseLogo || ''} size={baseLogoSize} className="z-[1]" symbol={baseSymbol} />
      <CoinIcon
        icon={quoteLogo || ''}
        className={`z-[2]`}
        size={quoteLogoSize}
        style={{ marginLeft: `-${quoteLogoSize / 2}px` }}
        symbol={quoteSymbol}
      />
    </div>
  )
}
