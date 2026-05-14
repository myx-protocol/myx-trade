import { Box } from '@mui/material'
import { TipsFill } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'

export const Error = ({ className = '', children }: { className: string; children: ReactNode }) => (
  <Box
    className={`text-wrong border-base flex items-center gap-[4px] rounded-[8px] border-1 p-[12px] text-[14px] leading-[1.5] ${className}`}
  >
    <TipsFill size={14} />
    <p className={'text-[12px]'}>{children}</p>
  </Box>
)

export const InsufficientBalance = ({ className = '' }: { className: string }) => {
  return (
    <Error className={className}>
      <Trans>Insufficient balance</Trans>
    </Error>
  )
}
