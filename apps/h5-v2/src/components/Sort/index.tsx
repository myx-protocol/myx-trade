import { useEffect, useState, type ReactNode } from 'react'
import SortDownIcon from '@/components/Icon/set/SortDown'
import clsx from 'clsx'

export type SortOrder = 'asc' | 'desc' | 'none'

interface SortProps {
  className?: string
  label?: ReactNode
  onChange?: (order: SortOrder) => void
  defaultOrder?: SortOrder
  isSorted?: boolean
}

export const Sort = ({
  className,
  label,
  onChange,
  defaultOrder = 'none',
  isSorted = false,
}: SortProps) => {
  const [order, setOrder] = useState<SortOrder>(defaultOrder)
  const handleClick = () => {
    let newOrder: SortOrder = 'asc'
    if (isSorted) {
      newOrder = order === 'asc' ? 'desc' : order === 'desc' ? 'none' : 'asc'
    }
    setOrder(newOrder)
    onChange?.(newOrder)
  }
  return (
    <div className={clsx('flex items-center gap-[4px]', className)} onClick={handleClick}>
      {label}
      <div className="flex flex-col items-center justify-center">
        <span
          className={clsx('inline-flex origin-center rotate-180', {
            'text-green': order === 'asc' && isSorted,
          })}
        >
          <SortDownIcon size={6} />
        </span>
        <span
          className={clsx('inline-flex', {
            'text-green': order === 'desc' && isSorted,
          })}
        >
          <SortDownIcon size={6} />
        </span>
      </div>
    </div>
  )
}
