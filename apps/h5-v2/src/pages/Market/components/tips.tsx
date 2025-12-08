import { TipsFill } from '@/components/Icon'
import Box from '@mui/material/Box'

export const Tips = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Box
      className={`border-dark-border text-regular flex gap-[8px] rounded-[12px] border-1 px-[16px] py-[20px] text-[12px] leading-[1.5] ${className}`}
    >
      <TipsFill size={12} className={'mt-[2px] flex-shrink-0'} />
      <span className={'text-regular flex-1'}>{children}</span>
    </Box>
  )
}
