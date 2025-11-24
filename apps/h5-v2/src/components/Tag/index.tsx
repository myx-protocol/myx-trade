import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface TagProps {
  children: React.ReactNode
  className?: string
  type?: 'success' | 'info' | 'danger'
}

export const Tag = ({ children, className, type = 'success' }: TagProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-[3px] px-[4px] pt-[4px] pb-[3px] text-[10px] font-normal',
          {
            'bg-green/10 text-green': type === 'success',
            'bg-[#202129] text-[#CED1D9]': type === 'info',
            'bg-danger/10 text-danger': type === 'danger',
          },
          className,
        ),
      )}
    >
      {children}
    </div>
  )
}
