import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface InputWrapperProps {
  children: React.ReactNode
  title?: ReactNode
  className?: string
}

export const InputWrapper = ({ children, title, className }: InputWrapperProps) => {
  return (
    <div
      className={twMerge(
        'rounded-[10px] bg-[#202129] px-[12px] py-[14px] leading-[1] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      {title && <div className="mb-[8px] text-[12px] font-normal text-[#848E9C]">{title}</div>}
      {children}
    </div>
  )
}
