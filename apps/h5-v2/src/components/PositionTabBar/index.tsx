import { type ReactNode } from 'react'
import clsx from 'clsx'

interface TabItem<T> {
  label: ReactNode
  value: T
}

interface PositionTabBarProps<T> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export const PositionTabBar = <T extends string | number>({
  items,
  value,
  onChange,
  className,
}: PositionTabBarProps<T>) => {
  return (
    <div
      className={clsx(
        'border-base flex items-center gap-[16px] border-b-1 px-[16px] pb-[12px]',
        className,
      )}
    >
      {items.map((item) => (
        <span
          key={String(item.value)}
          className={clsx('cursor-pointer text-[14px] leading-[1]', {
            'font-[700] text-white': item.value === value,
            'text-secondary font-[500]': item.value !== value,
          })}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}
