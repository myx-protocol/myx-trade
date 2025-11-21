import clsx from 'clsx'
import { memo } from 'react'
import type { ReactNode } from 'react'

interface MarketListRowProps {
  columnClasses?: [string | undefined, string | undefined, string | undefined]
  values: [ReactNode | undefined, ReactNode | undefined, ReactNode | undefined]
  className?: string
}

export const MarketListRow = memo(({ columnClasses, values, className }: MarketListRowProps) => {
  return (
    <div className={clsx('flex items-center justify-between gap-[20px]', className)}>
      {/* left */}
      <div className={clsx('min-w-[130px] shrink-0', columnClasses?.[0])}>{values[0]}</div>
      {/* right */}
      <div className="flex shrink-0 justify-end gap-[20px]">
        <div
          className={clsx(
            'flex min-w-[65px] shrink-0 items-center justify-end text-right',
            columnClasses?.[1],
          )}
        >
          {values[1]}
        </div>
        <div
          className={clsx(
            'flex min-w-[76px] shrink-0 items-center justify-end text-right',
            columnClasses?.[2],
          )}
        >
          {values[2]}
        </div>
      </div>
    </div>
  )
})
