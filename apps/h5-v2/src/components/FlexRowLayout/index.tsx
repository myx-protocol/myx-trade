import clsx from 'clsx'
import type { ReactNode } from 'react'

interface FlexRowLayoutProps {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export const FlexRowLayout = ({ left, right, className }: FlexRowLayoutProps) => {
  return (
    <div className={clsx('flex items-center justify-between gap-[24px] leading-none', className)}>
      <div className="min-w-fit shrink-0">{left}</div>
      <div className="flex flex-[1_1_0%] justify-end">{right}</div>
    </div>
  )
}
