import Big from 'big.js'
import clsx from 'clsx'
import { useState } from 'react'

export interface CoinIconProps {
  icon: string
  size?: number
  className?: string
  style?: React.CSSProperties
  symbol?: string
}
export const CoinIcon = ({ icon, size = 24, className, style, symbol = '' }: CoinIconProps) => {
  const [hasError, setHasError] = useState(false)
  const isShowIconIfNotError = !hasError && icon
  const iconSize = Big(size * 0.6).toFixed(2)
  return (
    <div
      className={clsx(
        `h-[${size}px] w-[${size}px] min-w-[${size}px] flex items-center justify-center overflow-hidden rounded-[9999px] bg-[#202129] text-[#848E9C]`,
        className,
      )}
      style={style}
    >
      {isShowIconIfNotError && (
        <img
          src={icon}
          alt=""
          className="h-full w-full"
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
        />
      )}

      {!isShowIconIfNotError && symbol && (
        <span className={clsx('text-[', iconSize, 'px]')}>{symbol?.[0]}</span>
      )}
    </div>
  )
}
