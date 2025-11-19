import type { ReactNode } from 'react'
import { Box } from '@mui/material'

const CardTitle = ({ title, icon }: { title: ReactNode; icon?: ReactNode }) => {
  return (
    <Box className={'flex items-center gap-[4px] px-[8px] leading-[1]'}>
      {icon}
      <span className={'leading-[1] font-[700] text-white'}>{title}</span>
    </Box>
  )
}
export const Card = ({
  title,
  children,
  icon,
  onClick,
}: {
  title: ReactNode
  children?: ReactNode
  icon?: ReactNode
  onClick?: () => void
}) => {
  return (
    <Box
      className={
        'border-base flex flex-1 flex-col gap-[12px] rounded-[16px] border-1 px-[12px] pt-[24px] pb-[12px]'
      }
      onClick={() => onClick?.()}
    >
      <CardTitle title={title} icon={icon}></CardTitle>
      <Box className={'flex flex-col gap-[12px]'}>{children}</Box>
    </Box>
  )
}
