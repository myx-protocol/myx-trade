import { usePositionStore } from '@/store/position/createStore'
import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useState } from 'react'

export const CloseAllPositionDialog = () => {
  const { closeAllPositionDialogOpen, setCloseAllPositionDialogOpen } = usePositionStore()
  const { client } = useMyxSdkClient()
  const [loading, setLoading] = useState(false)
  return (
    <DialogBase
      open={closeAllPositionDialogOpen}
      onClose={() => setCloseAllPositionDialogOpen(false)}
    >
      <InfoIcon width={56} height={56} className="mx-auto mt-[40px]" />
      <p className="mt-[20px] text-center text-[16px] leading-[16px] text-[white]">
        <Trans>Please confirm whether to</Trans>
      </p>
      <p className="mt-[5px] text-center text-[16px] leading-[16px] text-[#F29D39]">
        <Trans>close all positions at market price?</Trans>
      </p>
      <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
        <PrimaryButton
          onClick={async () => {
            toast.success({
              title: t`Close all positions success`,
              content: <Trans>Close all positions success</Trans>,
            })
            setCloseAllPositionDialogOpen(false)
          }}
          className="w-full"
          style={{
            borderRadius: '44px',
            height: '44px',
          }}
        >
          <span className="text-[14px] font-[500] text-[#FFFFFF]">
            <Trans>Confirm</Trans>
          </span>
        </PrimaryButton>
      </div>
    </DialogBase>
  )
}
