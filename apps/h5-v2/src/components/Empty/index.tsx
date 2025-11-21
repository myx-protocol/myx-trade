import EmptyPng from '@/assets/images/common/empty.png'
import { t } from '@lingui/core/macro'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface EmptyProps {
  className?: string
  emptyText?: string | ReactNode
}

export const Empty = ({ className = '', emptyText = t`No records found` }: EmptyProps) => {
  return (
    <div className={twMerge(clsx('flex shrink-0 flex-col items-center justify-center', className))}>
      <img src={EmptyPng} alt="empty" className="h-[56px] w-[56px]" />
      <p className="mt-[16px] text-[12px] font-medium text-[#848E9C]">{emptyText}</p>
    </div>
  )
}
