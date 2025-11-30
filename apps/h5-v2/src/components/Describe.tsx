import { Box } from '@mui/material'
import type { ReactNode } from 'react'

const Describe = ({ className = '', children }: { className?: string; children?: ReactNode }) => {
  return (
    <Box className={`flex flex-col gap-[16px] ${className} text-[12px] leading-[1] font-[400]`}>
      {children}
    </Box>
  )
}

const DescribeItem = ({
  title = 'Item title',
  children,
  className = '',
}: {
  title: ReactNode | string
  className?: string
  children?: ReactNode
}) => {
  return (
    <Box className={`flex items-center justify-between ${className}`}>
      <span className={'text-secondary flex items-center gap-[4px]'}>{title}</span>

      <Box className={'flex flex-1 justify-end gap-[2px] leading-[1] font-[500] text-white'}>
        {children}
      </Box>
    </Box>
  )
}

export { Describe, DescribeItem }
