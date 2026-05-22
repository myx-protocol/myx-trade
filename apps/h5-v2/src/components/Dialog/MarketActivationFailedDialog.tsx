import { DialogBase } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import React, { memo } from 'react'
import { Box, Button } from '@mui/material'
import WarningLine from '@/components/Icon/set/WarningLine.tsx'
import { useDialogHandle } from '@/hooks/useDialogHandle.ts'
import { formatNumber } from '@/utils/number.ts'

interface MarketActivationFailedDialogProps {
  open: boolean
  onClose: () => void
  onLater: () => void
  onClaimRefund: () => void
  deductedAmount?: string
  refundAmount?: string
  tokenSymbol?: string
}

const MarketActivationFailedFooter = memo(
  ({ onLater, onClaimRefund }: { onLater: () => void; onClaimRefund: () => void }) => {
    const { loading: laterLoading, onConfirm: onLaterHandle } = useDialogHandle({
      onConfirm: onLater,
    })
    const { loading: claimLoading, onConfirm: onClaimRefundHandle } = useDialogHandle({
      onConfirm: onClaimRefund,
    })

    return (
      <Box className={'flex w-full gap-[12px] px-[20px] pb-[24px]'}>
        <Button
          className={'gradient gray !min-h-[44px] !rounded-[44px]'}
          loading={laterLoading}
          onClick={onLaterHandle}
        >
          <span className={'text-[14px] font-medium text-white capitalize'}>
            <Trans>Later</Trans>
          </span>
        </Button>
        <Button
          className={'gradient !min-h-[44px] flex-1 !rounded-[44px]'}
          loading={claimLoading}
          onClick={onClaimRefundHandle}
        >
          <span className={'text-[14px] font-medium text-white'}>
            <Trans>Claim Refund</Trans>
          </span>
        </Button>
      </Box>
    )
  },
)

export const MarketActivationFailedDialog = memo(
  ({
    open,
    onClose,
    onLater,
    onClaimRefund,
    deductedAmount,
    refundAmount,
    tokenSymbol = '--',
  }: MarketActivationFailedDialogProps) => {
    return (
      <DialogBase
        open={open}
        onClose={onClose}
        showCloseIcon
        title={null}
        footer={<MarketActivationFailedFooter onLater={onLater} onClaimRefund={onClaimRefund} />}
        contentClassname={'!pt-0'}
      >
        <Box className={'flex flex-col items-center'}>
          <Box className={'text-secondary pb-[20px]'}>
            <WarningLine size={56} />
          </Box>
          <Box className={'flex flex-col items-center gap-[12px]'}>
            <p className={'text-center text-[20px] leading-[1.5] font-[700] text-white'}>
              <Trans>Market Activation Failed</Trans>
            </p>
            <p className={'text-center text-[14px] leading-[1.5] font-medium text-white'}>
              <Trans>Your request to early launch the market could not be executed.</Trans>
            </p>
          </Box>
          <Box className={'mt-[24px] flex flex-col gap-[8px]'}>
            <p className={'text-secondary text-left text-[12px] leading-[1.5] font-medium'}>
              <Trans>This is typically due to:</Trans>
            </p>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>Underlying token security risks (Failed Prime Check)</Trans>
              <br />
              <Trans>Sudden on-chain liquidity drop below the minimum threshold</Trans>
            </p>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>
                Fund Resolution: Per platform rules,{' '}
                {formatNumber(deductedAmount, { showUnit: false, decimals: 0 })} {tokenSymbol} has
                been deducted for oracle and security review costs. The remaining{' '}
                {formatNumber(refundAmount, { showUnit: false, decimals: 0 })} {tokenSymbol} has
                been unlocked and is available for immediate withdrawal.
              </Trans>
            </p>
          </Box>
        </Box>
      </DialogBase>
    )
  },
)
