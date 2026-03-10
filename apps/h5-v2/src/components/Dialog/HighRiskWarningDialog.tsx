import { WarningDialog } from '@/components/DialogBase/WarningDialog.tsx'
import { Trans } from '@lingui/react/macro'
import React, { memo } from 'react'
import { Box } from '@mui/material'

interface HighRiskWarningDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}
export const HighRiskWarningDialog = memo(
  ({ open, onClose, onConfirm }: HighRiskWarningDialogProps) => {
    return (
      <WarningDialog
        open={open}
        tipTextTitle={<Trans>High-Risk Asset Warning</Trans>}
        confirmText={<Trans>Confirm</Trans>}
        onClose={onClose}
        onConfirm={onConfirm}
        tipText={
          <Box className={'flex flex-col gap-[8px] text-center text-[14px] leading-[1.5]'}>
            <p className={'text-secondary'}>
              <Trans>
                Security scans indicate that this token has critical security risks (e.g., malicious
                code, honeypot, or high transaction taxes). If you continue to provide liquidity,
                you may face permanent loss of your assets or be unable to withdraw them.
              </Trans>
            </p>
            <p className={'text-regular'}>
              ⚠️ <Trans>Please note: </Trans> <br />
              <Trans>
                To ensure a secure trading environment, the platform strictly prohibits and rejects
                the listing of such high-risk tokens on the contract market.
              </Trans>
            </p>
          </Box>
        }
      />
    )
  },
)
