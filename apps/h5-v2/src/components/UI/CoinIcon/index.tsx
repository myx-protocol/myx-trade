import Big from 'big.js'
import clsx from 'clsx'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface CoinIconProps {
  icon?: string
  size?: number
  className?: string
  style?: React.CSSProperties
  symbol?: string
  showBorder?: boolean
}
export const CoinIcon = ({
  icon,
  size = 24,
  className,
  style,
  symbol = '',
  showBorder = true,
}: CoinIconProps) => {
  const [hasError, setHasError] = useState(false)
  const isShowIconIfNotError = !hasError && icon
  const iconSize = Big(size * 0.6).toFixed(2)
  return (
    <div
      className={twMerge(
        'flex items-center justify-center overflow-hidden rounded-[9999px] bg-[#202129] text-[#848E9C]',
        showBorder && 'border-light-border border-1',
        className,
      )}
      style={{
        height: `${size}px`,
        width: `${size}px`,
        minWidth: `${size}px`,
        ...style,
      }}
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
