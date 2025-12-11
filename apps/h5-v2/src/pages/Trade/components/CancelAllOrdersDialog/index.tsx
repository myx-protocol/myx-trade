import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import useGlobalStore from '@/store/globalStore'
import { usePositionStore } from '@/store/position/createStore'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const CancelAllOrdersDialog = () => {
  const { selectChainId } = usePositionStore()
  const { client } = useMyxSdkClient(Number(selectChainId))
  const [loading, setLoading] = useState(false)
  const { cancelAllOrdersDialogOpen, setCancelAllOrdersDialogOpen } = useGlobalStore()
  const orders = useGetOrderList()

  return (
    <>
      <DialogBase
        open={cancelAllOrdersDialogOpen}
        onClose={() => setCancelAllOrdersDialogOpen(false)}
      >
        <InfoIcon width={56} height={56} className="mx-auto mt-[40px]" />
        <p className="mt-[20px] text-center text-[16px] leading-[16px] text-[white]">
          <Trans>Are you sure to</Trans>
        </p>
        <p className="mt-[5px] text-center text-[16px] leading-[16px] text-[#F29D39]">
          <Trans>cancel all open orders?</Trans>
        </p>
        <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
          <PrimaryButton
            onClick={async () => {
              try {
                setLoading(true)
                const rs = await client?.order.cancelOrders(
                  orders.map((item: any) => item.orderId),
                  Number(selectChainId),
                )
                if (rs?.code === 0) {
                  toast.success({
                    title: t`Cancel all orders success`,
                  })
                  setCancelAllOrdersDialogOpen(false)
                } else {
                  toast.error({
                    title: t`Cancel all orders failed`,
                  })
                }
              } catch (e) {
                console.log(e)
                toast.error({
                  title: t`Cancel all orders failed`,
                })
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
