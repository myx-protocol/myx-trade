import type { ReactNode } from 'react'
import { Box } from '@mui/material'

export const Card = ({
  title,
  children,
  className = '',
}: {
  title?: ReactNode
  children?: ReactNode
  className?: string
}) => {
  return (
    <Box
      className={`bg-base flex flex-col gap-[12px] rounded-[16px] px-[16px] py-[20px] ${className}`}
    >
      <Box className={'text-regular flex items-center justify-between text-[14px] font-[500]'}>
        {title}
      </Box>
      {children}
    </Box>
  )
}
