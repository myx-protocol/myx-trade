import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { formatNumber } from '@/utils/number.ts'

export const Statistic = ({
  value,
  title,
  children,
}: {
  value: string
  title: ReactNode
  children?: ReactNode
}) => {
  return (
    <Box className={'flex h-full w-full flex-col rounded-[8px] bg-[rgba(24,25,31,0.60)] p-[16px]'}>
      <Box className={'flex flex-col gap-[6px]'}>
        <h3 className={'text-[16px] leading-[1.1] font-[500] text-white'}>
          {formatNumber(value, { showUnit: true })}
        </h3>
        <Box className={'text-secondary text-[12px] leading-[1]'}>{title}</Box>
      </Box>
      <Box className={'relative flex-1'}>{children}</Box>
    </Box>
  )
}
