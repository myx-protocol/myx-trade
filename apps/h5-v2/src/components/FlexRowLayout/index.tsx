import clsx from 'clsx'
import type { ReactNode } from 'react'

interface FlexRowLayoutProps {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export const FlexRowLayout = ({ left, right, className }: FlexRowLayoutProps) => {
  return (
    <div className={clsx('flex items-center justify-between leading-[1]', className)}>
      <div className="max-w-[50%]">{left}</div>
      <div className="max-w-[50%]">{right}</div>
    </div>
  )
}
