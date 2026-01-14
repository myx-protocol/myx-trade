import { Box } from '@mui/material'
import { TipsFill } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'

export const Error = ({ className = '' }: { className: string }) => (
  <Box
    className={`text-wrong border-base flex items-center gap-[4px] rounded-[8px] border-1 p-[12px] text-[14px] leading-[1.5] ${className}`}
  >
    <TipsFill size={14} />
    <p className={'text-[12px]'}>
      <Trans>Insufficient balance</Trans>
    </p>
  </Box>
)
