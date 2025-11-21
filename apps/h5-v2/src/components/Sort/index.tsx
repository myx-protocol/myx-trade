import { useState, type ReactNode } from 'react'
import SortDownIcon from '@/components/Icon/set/SortDown'
import clsx from 'clsx'

interface SortProps {
  className?: string
  label?: ReactNode
  onChange?: (order: 'asc' | 'desc' | 'none') => void
  defaultOrder?: 'asc' | 'desc' | 'none'
}

export const Sort = ({ className, label, onChange, defaultOrder = 'none' }: SortProps) => {
  const [order, setOrder] = useState<'asc' | 'desc' | 'none'>(defaultOrder)
  const handleClick = () => {
    const newOrder = order === 'asc' ? 'desc' : order === 'desc' ? 'none' : 'asc'
    setOrder(newOrder)
    onChange?.(newOrder)
  }
  return (
    <div className={clsx('flex items-center gap-[4px]', className)} onClick={handleClick}>
      {label}
      <div className="flex flex-col items-center justify-center">
        <span
          className={clsx('inline-flex origin-center rotate-180', {
            'text-green': order === 'asc',
          })}
        >
          <SortDownIcon size={6} />
        </span>
        <span
          className={clsx('inline-flex', {
            'text-green': order === 'desc',
          })}
        >
          <SortDownIcon size={6} />
        </span>
      </div>
    </div>
  )
}
