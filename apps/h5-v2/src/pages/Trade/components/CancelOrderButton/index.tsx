import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { showErrorToast } from '@/config/error'
import { useGetActivePoolList } from '@/components/Trade/hooks/use-get-pool-list'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { TradeMode } from '../../types'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { Direction, OrderType } from '@myx-trade/sdk'
import { buildCancelOrderToastParts, renderOrderToastContent } from '@/utils/order/action-toast'

export const CancelOrderButton = ({
  orderId,
  chainId,
  poolId,
  className,
  orderInfo,
}: {
  orderId: number
  chainId: number
  poolId: string
  className?: string
  orderInfo?: {
    direction: Direction
    size: string
    price: string
    orderType: OrderType
    isIncrease: boolean
    baseSymbol: string
    quoteSymbol: string
  }
}) => {
  const { client } = useMyxSdkClient(Number(chainId))
  const [loading, setLoading] = useState(false)
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false)

  const { poolList } = useGetActivePoolList()

  const pool = poolList.find((item: any) => item.poolId === poolId)
  const { tradeMode } = useGlobalStore()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(chainId)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  return (
    <>
      <InfoButton
        className={className}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 500,
          lineHeight: 1,
        }}
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

                if (tradeMode === TradeMode.Seamless) {
                  const seamlessAccount = seamlessAccountList.find(
                    (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
                  )
                  if (!seamlessAccount) {
                    return
                  }

                  const isAuthorizedRes = await getSeamlessAuthStatus({
                    masterAddress: activeSeamlessAddress,
                    seamlessAddress: seamlessAccount.seamlessAddress,
                    chainId: chainId as number,
                    tokenAddress: pool?.quoteToken as string,
                  })

                  const isAuthorized = isAuthorizedRes?.data?.auth

                  if (!isAuthorized) {
                    toast.error({ title: t`Seamless account not authorized` })
                    return
                  }

                  const rs = await forwardSeamlessTransaction({
                    chainId: chainId as number,
                    masterAddress: activeSeamlessAddress,
                    seamlessAddress: seamlessAccount.seamlessAddress,
                    forwardFeeToken: pool?.quoteToken as string,
                    functionName: 'cancelOrder',
                    orderParams: [orderId],
                  })

                  if (rs?.code === 0) {
                    if (orderInfo) {
                      const _parts = buildCancelOrderToastParts(orderInfo)
                      toast.success({
                        title: _parts.title,
                        content: renderOrderToastContent(_parts),
                      })
                    } else {
                      toast.success({ title: t`Cancel order success` })
                    }
                    setCancelOrderDialogOpen(false)
                  } else {
                    showErrorToast(client?.utils.formatErrorMessage(rs))
                  }

                  return
                }

                const rs = await client?.order.cancelOrder(orderId.toString(), Number(chainId))
                if (rs?.code === 0) {
                  if (orderInfo) {
                    const _parts = buildCancelOrderToastParts(orderInfo)
                    toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                  } else {
                    toast.success({ title: t`Cancel order success` })
                  }
                  setCancelOrderDialogOpen(false)
                } else {
                  showErrorToast(client?.utils.formatErrorMessage(rs))
                }
              } catch (e) {
                showErrorToast(e)
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
