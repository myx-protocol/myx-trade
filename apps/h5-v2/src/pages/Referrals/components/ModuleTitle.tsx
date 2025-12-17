import type { ReactNode } from 'react'

export const ModuleTitle = ({
  children,
  more,
  className,
}: React.PropsWithChildren<{ more?: ReactNode | undefined; className?: string }>) => {
  return (
    <div className={`flex items-center gap-[9px] ${className || ''}`}>
      <div className="h-[24px] w-[3px] bg-[#00E3A5]"></div>

      <div className="flex-1 text-[18px] leading-none font-bold text-white lg:text-[24px]">
        {children}
      </div>

      {more && <>{more}</>}
    </div>
  )
}
