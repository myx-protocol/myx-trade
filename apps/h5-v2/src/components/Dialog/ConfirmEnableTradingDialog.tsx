import { DialogBase } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import React, { memo } from 'react'
import { Box, Button } from '@mui/material'
import RocketLaunchLine from '@/components/Icon/set/RocketLaunchLine.tsx'
import { useDialogHandle } from '@/hooks/useDialogHandle.ts'
import { formatNumber } from '@/utils/number.ts'

interface ConfirmEnableTradingDialogProps {
  open: boolean
  onClose: () => void
  onNotNow: () => void
  onPay: () => void
  feeAmount?: string
  tvlThreshold?: string
  deductedAmount?: string
  refundAmount?: string
  tokenSymbol?: string
}

const ConfirmEnableTradingFooter = memo(
  ({
    onNotNow,
    onPay,
    feeAmount,
    tokenSymbol,
  }: {
    onNotNow: () => void
    onPay: () => void
    feeAmount?: string
    tokenSymbol?: string
  }) => {
    const { loading: notNowLoading, onConfirm: onNotNowHandle } = useDialogHandle({
      onConfirm: onNotNow,
    })
    const { loading: payLoading, onConfirm: onPayHandle } = useDialogHandle({
      onConfirm: onPay,
    })

    return (
      <Box className={'flex w-full gap-[12px] px-[20px] pb-[24px]'}>
        <Button
          className={
            '!border-dark-border !bg-dark-border !hover:bg-dark-border !hover:opacity-60 !min-h-[44px] flex-[122] !rounded-[44px] !border-1 !px-[32px]'
          }
          loading={notNowLoading}
          onClick={onNotNowHandle}
        >
          <span className={'text-[14px] font-medium text-white capitalize'}>
            <Trans>Not Now</Trans>
          </span>
        </Button>
        <Button
          className={'gradient !min-h-[44px] flex-1 flex-[216] !rounded-[44px]'}
          loading={payLoading}
          onClick={onPayHandle}
        >
          <span className={'text-[14px] font-medium text-white'}>
            <Trans>
              Pay {formatNumber(feeAmount, { showUnit: false, decimals: 0 })} {tokenSymbol}
            </Trans>
          </span>
        </Button>
      </Box>
    )
  },
)

export const ConfirmEnableTradingDialog = memo(
  ({
    open,
    onClose,
    onNotNow,
    onPay,
    feeAmount,
    tvlThreshold,
    deductedAmount,
    refundAmount,
    tokenSymbol = '--',
  }: ConfirmEnableTradingDialogProps) => {
    return (
      <DialogBase
        open={open}
        onClose={onClose}
        showCloseIcon
        title={null}
        footer={
          <ConfirmEnableTradingFooter
            onNotNow={onNotNow}
            onPay={onPay}
            feeAmount={feeAmount}
            tokenSymbol={tokenSymbol}
          />
        }
      >
        <Box className={'flex flex-col items-center'}>
          <Box className={'text-secondary pb-[20px]'}>
            <RocketLaunchLine size={56} />
          </Box>
          <Box className={'flex flex-col items-center gap-[12px]'}>
            <p className={'text-center text-[20px] leading-[1.5] font-[700] text-white'}>
              <Trans>Confirm Enable Trading</Trans>
            </p>
            <p className={'text-center text-[14px] leading-[1.5] font-medium text-white'}>
              <Trans>
                You are about to{' '}
                <span className={'text-warning'}>
                  pay a {formatNumber(feeAmount, { showUnit: false, decimals: 0 })} {tokenSymbol}
                </span>{' '}
                oracle and network fee. Once the market's TVL reaches{' '}
                {formatNumber(tvlThreshold, { showUnit: false, decimals: 0 })} {tokenSymbol}, the
                system will automatically connect to the oracle and enable trading.
              </Trans>
            </p>
          </Box>
          <Box className={'mt-[24px] flex flex-col gap-[8px]'}>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>
                ⚠️ Fund Deduction Risk (Irreversible): After payment authorization, if the
                activation fails or is aborted due to any of the following reasons, the system will
                strictly{' '}
                <span className={'text-warning'}>
                  deduct {formatNumber(deductedAmount, { showUnit: false, decimals: 0 })}{' '}
                  {tokenSymbol}
                </span>{' '}
                for review costs:
              </Trans>
            </p>
            <ul
              className={
                'text-secondary ml-[1em] list-outside list-disc text-left text-[12px] leading-[1.5]'
              }
            >
              <li>
                <Trans>The underlying token poses security risks (Failed Prime Check)</Trans>
              </li>
              <li>
                <Trans>
                  You manually cancel the payment before trading is successfully enabled
                </Trans>
              </li>
            </ul>
            <p className={'text-secondary text-left text-[12px] leading-[1.5]'}>
              <Trans>
                If the activation is aborted,{' '}
                <span className={'text-warning'}>
                  the remaining {formatNumber(refundAmount, { showUnit: false, decimals: 0 })}{' '}
                  {tokenSymbol} will be refunded and must be claimed manually.
                </span>
              </Trans>
            </p>
          </Box>
        </Box>
      </DialogBase>
    )
  },
)
