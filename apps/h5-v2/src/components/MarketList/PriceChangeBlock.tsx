import { decimalToPercent, type PercentFormatOptions } from '@/utils/number'
import Big from 'big.js'
import clsx from 'clsx'

interface PriceChangeBlockProps {
  value: number
  options?: PercentFormatOptions
  className?: string
}

export const PriceChangeBlock = ({
  className,
  value,
  options = {
    showSign: true,
    removeTrailingZeros: true,
    decimals: 2,
  },
}: PriceChangeBlockProps) => {
  return (
    <div
      className={clsx(
        'w-full min-w-fit rounded-[4px] px-[12px] py-[7px] text-center text-[12px] leading-[1.2] font-medium text-white',
        {
          'bg-green': Big(value).gt(0),
          'bg-danger': Big(value).lt(0),
          'bg-base': Big(value).eq(0),
        },
        className,
      )}
    >
      {decimalToPercent(value, options)}
    </div>
  )
}
