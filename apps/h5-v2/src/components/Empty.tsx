import Box from '@mui/material/Box'
import EmptyPng from '@/assets/images/common/empty.png'
import { t } from '@lingui/core/macro'
import type { ReactNode } from 'react'

export const Empty = ({
  className = '',
  children,
  emptyText,
}: {
  className?: string
  children?: ReactNode
  emptyText?: string | ReactNode
}) => {
  return (
    <>
      <Box className={`flex flex-col items-center justify-center ${className}`}>
        <img src={EmptyPng} alt="empty" className="h-[56px] w-[56px]" />
        <div className="mt-[16px] text-[12px] font-medium text-[#848E9C]">
          {emptyText ? <> {emptyText} </> : t`No results found`}
        </div>
        {children}
      </Box>
    </>
  )
}
