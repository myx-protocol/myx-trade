import { formatNumber } from '@/utils/number'
import Big, { type BigSource } from 'big.js'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

interface PriceProps {
  value: BigSource
  showUnit?: boolean
  decimals?: number
  className?: string
}

enum PriceChangeMode {
  None = 'none',
  Rise = 'rise',
  Fall = 'fall',
}

/***
 * cache price value and mode
 */

export const Price = ({ className, value, showUnit = false, decimals }: PriceProps) => {
  const priceValueRef = useRef<BigSource>(value)
  const modeRef = useRef<PriceChangeMode>(PriceChangeMode.None)
  useEffect(() => {
    if (Big(value).eq(priceValueRef.current)) {
      modeRef.current = PriceChangeMode.None
    } else if (Big(value).gt(priceValueRef.current)) {
      modeRef.current = PriceChangeMode.Rise
    } else {
      modeRef.current = PriceChangeMode.Fall
    }
    priceValueRef.current = value
  }, [value])
  return (
    <span
      className={clsx(
        'text-white',
        {
          'text-rise': modeRef.current === PriceChangeMode.Rise,
          'text-fall': modeRef.current === PriceChangeMode.Fall,
        },
        className,
      )}
    >
      {formatNumber(value, {
        showUnit,
        decimals,
      })}
    </span>
  )
}
