import { Help } from '@/components/Icon'
import { Box } from '@mui/material'
import type { ReactNode } from 'react'

export const TipBox = ({ children }: { children: ReactNode }) => {
  return (
    <Box className="flex gap-[8px] rounded-[10px] border border-[#292B33] px-[20px] py-[16px] text-[12px] leading-[1.5] text-[#CED1D9]">
      <Help size={14} color="#F29D39" className="mt-[2px] flex-shrink-0" />
      <p>{children}</p>
    </Box>
  )
}
