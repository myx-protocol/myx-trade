import { DialogBase } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import React, { memo } from 'react'
import { Box, Button } from '@mui/material'
import WarningLine from '@/components/Icon/set/WarningLine.tsx'
import { useDialogHandle } from '@/hooks/useDialogHandle.ts'
import { formatNumber } from '@/utils/number.ts'

interface MarketLaunchStatusDialogProps {
  open: boolean
  onClose: () => void
  onAbort: () => void
  onWait: () => void
  refundAmount?: string
  penaltyAmount?: string
  feeAmount?: string
  minTVL?: string
  tokenSymbol?: string
}

const MarketLaunchStatusFooter = memo(
  ({
    onAbort,
    onWait,
    refundAmount,
    penaltyAmount,
    tokenSymbol = '--',
  }: {
    onAbort: () => void
    onWait: () => void
    refundAmount?: string
    penaltyAmount?: string
    tokenSymbol?: string
  }) => {
    const { loading: abortLoading, onConfirm: onAbortHandle } = useDialogHandle({
      onConfirm: onAbort,
    })
    const { loading: waitLoading, onConfirm: onWaitHandle } = useDialogHandle({
      onConfirm: onWait,
    })

    return (
      <Box className={'flex w-full gap-[10px] px-[20px] pb-[24px]'}>
        <Button
          className={'gradient gray !min-h-[44px] !rounded-[44px] !px-[14px]'}
          loading={abortLoading}
          onClick={onAbortHandle}
        >
          <span className={'text-[14px] font-medium text-white capitalize'}>
            <Trans>
              abort & refund {formatNumber(refundAmount, { showUnit: false, decimals: 0 })}{' '}
              {tokenSymbol}
            </Trans>
          </span>
        </Button>
        <Button
          className={'gradient flex-shrik-0 !min-h-[44px] flex-1 !rounded-[44px] !px-[14px]'}
          loading={waitLoading}
          onClick={onWaitHandle}
        >
          <span className={'text-[14px] font-medium text-white'}>
            <Trans>Wait for Launch</Trans>
          </span>
        </Button>
      </Box>
    )
  },
)

export const MarketLaunchStatusDialog = memo(
  ({
    open,
    onClose,
    onAbort,
    onWait,
    refundAmount,
    penaltyAmount,
    feeAmount,
    minTVL,
    tokenSymbol = '--',
  }: MarketLaunchStatusDialogProps) => {
    return (
      <DialogBase
        open={open}
        onClose={onClose}
        showCloseIcon
        title={null}
        footer={
          <MarketLaunchStatusFooter
            onAbort={onAbort}
            onWait={onWait}
            refundAmount={refundAmount}
            penaltyAmount={penaltyAmount}
            tokenSymbol={tokenSymbol}
          />
        }
        contentClassname={'!pt-0'}
      >
        <Box className={'flex flex-col items-center'}>
          <Box className={'text-secondary pb-[20px]'}>
            <WarningLine size={56} />
          </Box>
          <Box className={'flex flex-col items-center gap-[12px]'}>
            <p className={'text-center text-[20px] leading-[1.5] font-[700] text-white'}>
              <Trans>Market Launch Status</Trans>
            </p>
            <p className={'text-center text-[14px] leading-[1.5] font-medium text-white'}>
              <Trans>
                Your {formatNumber(feeAmount, { showUnit: false, decimals: 0 })} {tokenSymbol} fee
                is secured. The smart contract is automatically processing your launch request.
              </Trans>
            </p>
          </Box>
          <Box className={'mt-[24px] flex flex-col gap-[12px]'}>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>⏳ Pending Validations:</Trans>
              <br />
              <Trans>Trading will force start instantly once the system confirms:</Trans>
              <br />
              <Trans>
                • The {formatNumber(minTVL, { showUnit: false, decimals: 0 })} {tokenSymbol} minimum
                TVL threshold is met.
              </Trans>
              <br />
              <Trans>• The token passes the Prime Check security scan.</Trans>
            </p>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>⚠️ Cancellation Penalty:</Trans>
              <br />
              <Trans>
                {'>'} Aborting now will incur a strict{' '}
                {formatNumber(penaltyAmount, { showUnit: false, decimals: 0 })} {tokenSymbol}{' '}
                deduction for network overhead. You will receive a partial refund of{' '}
                {formatNumber(refundAmount, { showUnit: false, decimals: 0 })} {tokenSymbol}.
              </Trans>
            </p>
          </Box>
        </Box>
      </DialogBase>
    )
  },
)
