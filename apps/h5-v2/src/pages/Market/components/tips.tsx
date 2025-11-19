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
      className={`border-dark-border flex gap-[8px] rounded-[12px] border-1 px-[16px] py-[20px] text-[14px] leading-[1.5] ${className}`}
    >
      <TipsFill size={16} className={'mt-[2px]'} />
      <span className={'text-regular'}>{children}</span>
    </Box>
  )
}
