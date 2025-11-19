import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CollapseGroupProps {
  children: React.ReactNode
  className?: string
}

export const CollapseGroup = ({ children, className }: CollapseGroupProps) => {
  return (
    <div className={twMerge(clsx('flex flex-col border-b-[1px] border-[#202129]', className))}>
      {children}
    </div>
  )
}
