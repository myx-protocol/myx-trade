import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useState } from 'react'
import type { ChainId } from '@/config/chain.ts'

interface ClaimTotalRewardsDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  chainIds: (number | ChainId)[]
}

const RewardListSelector = (props: { value?: string; onChange?: (value: string) => void }) => {
  return (
    <div className="flex min-h-[160px] flex-col gap-[8px] pt-[16px]">
      {['1', '2'].map((value) => (
        <div
          key={value}
          className={clsx(
            'flex items-center justify-between rounded-[8px] border-[1px] border-[#202129] px-[12px] py-[16px] leading-[1] text-white',
            {
              'bg-[#202129]': value !== props.value,
              'bg-[rgba(0,227,165,0.05)]': value === props.value,
              'border-[rgba(0,227,165,0.7)]': value === props.value,
            },
          )}
          onClick={() => props.onChange?.(value)}
          role="button"
        >
          <p className="text-[14px] font-medium">BNBCHAIN</p>
          <p className="text-[16px] font-medium">$12313</p>
        </div>
      ))}
    </div>
  )
}

export const ClaimTotalRewardsDialog = ({
  open,
  onClose,
  onConfirm,
  chainIds = [],
}: ClaimTotalRewardsDialogProps) => {
  const [value, setValue] = useState<string>('1')
  return (
    <DialogBase title={t`领取全部收益`} open={open} onClose={onClose}>
      <RewardListSelector value={value} onChange={setValue} />
      <PrimaryButton
        className="mt-[20px]! h-[44px] w-full rounded-[999px]! text-[14px]! font-medium!"
        onClick={onConfirm}
      >
        <Trans>Claim Now</Trans>
      </PrimaryButton>
    </DialogBase>
  )
}
