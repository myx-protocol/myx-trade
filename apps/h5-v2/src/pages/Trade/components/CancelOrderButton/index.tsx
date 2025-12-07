import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const CancelOrderButton = ({ order }: { order: any }) => {
  const { client } = useMyxSdkClient()
  const [loading, setLoading] = useState(false)
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false)
  return (
    <>
      <InfoButton
        onClick={async () => {
          setCancelOrderDialogOpen(true)
        }}
      >
        <Trans>Cancel</Trans>
      </InfoButton>
      <DialogBase open={cancelOrderDialogOpen} onClose={() => setCancelOrderDialogOpen(false)}>
        <InfoIcon width={56} height={56} className="mx-auto mt-[40px]" />
        <p className="mt-[20px] text-center text-[16px] leading-[16px] text-[white]">
          <Trans>Are you sure to</Trans>
        </p>
        <p className="mt-[5px] text-center text-[16px] leading-[16px] text-[#F29D39]">
          <Trans>Cancel this order?</Trans>
        </p>
        <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
          <PrimaryButton
            onClick={async () => {
              try {
                setLoading(true)
                await client?.order.cancelOrder(order.orderId, order.chainId)
                toast.success({
                  title: t`Cancel order success`,
                })
                setCancelOrderDialogOpen(false)
              } catch (e) {
                console.log(e)
              } finally {
                setLoading(false)
              }
            }}
            loading={loading}
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
    </>
  )
}
