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
import { showErrorToast } from '@/config/error'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '../../types'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { useGetActivePoolList } from '@/components/Trade/hooks/use-get-pool-list'

export const CancelAllOrdersDialog = () => {
  const { selectChainId } = usePositionStore()
  const { client } = useMyxSdkClient(Number(selectChainId))
  const [loading, setLoading] = useState(false)
  const { cancelAllOrdersDialogOpen, setCancelAllOrdersDialogOpen } = usePositionStore()
  const orders = useGetOrderList()
  const { tradeMode } = useGlobalStore()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(Number(selectChainId))
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { poolList } = useGetActivePoolList()

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

                if (tradeMode === TradeMode.Seamless) {
                  const seamlessAccount = seamlessAccountList.find(
                    (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
                  )
                  if (!seamlessAccount) {
                    return
                  }

                  const authData = await Promise.all(
                    orders.map(async (order: any) => {
                      const pool = poolList.find(
                        (poolItem: any) => order.poolId === poolItem?.poolId,
                      )
                      const isAuthorizedRes = await getSeamlessAuthStatus({
                        masterAddress: activeSeamlessAddress,
                        seamlessAddress: seamlessAccount.seamlessAddress,
                        chainId: order.chainId as number,
                        tokenAddress: pool?.quoteToken as string,
                      })

                      const isAuthorized = isAuthorizedRes?.data?.auth
                      return {
                        orderId: order.orderId,
                        isAuthorized: isAuthorized,
                      }
                    }),
                  )

                  const couldCancelOrders = orders.filter((item: any) => {
                    return authData.find((authItem: any) => authItem.orderId === item.orderId)
                      ?.isAuthorized
                  })

                  if (couldCancelOrders.length === 0) {
                    return
                  }

                  const ordersByMarket = couldCancelOrders.reduce((acc: any, order: any) => {
                    const pool = poolList.find((poolItem: any) => order.poolId === poolItem?.poolId)
                    const marketId = pool?.marketId

                    if (!marketId) {
                      return acc
                    }

                    const groupKey = `${order.chainId}-${marketId}`
                    if (acc[groupKey]) {
                      acc[groupKey].push({
                        order,
                        pool,
                      })
                    } else {
                      acc[groupKey] = [
                        {
                          order,
                          pool,
                        },
                      ]
                    }
                    return acc
                  }, {})

                  const dataArray = Object.values(ordersByMarket).map((group: any) => {
                    const groupOrders = group as Array<{ order: any; pool: any }>
                    const firstItem = groupOrders[0]
                    const orderIds = groupOrders.map((item) => item.order.orderId)
                    return {
                      chainId: firstItem.order.chainId,
                      forwardFeeToken: firstItem.pool?.quoteToken as string,
                      orderIds,
                    }
                  })

                  const rs = await Promise.all(
                    dataArray.map(async (item: any) => {
                      const { orderIds, chainId, forwardFeeToken } = item
                      const forwardRs = await forwardSeamlessTransaction({
                        chainId: chainId as number,
                        masterAddress: activeSeamlessAddress,
                        seamlessAddress: seamlessAccount.seamlessAddress,
                        forwardFeeToken,
                        functionName: 'cancelOrders',
                        orderParams: [orderIds],
                      })

                      if (forwardRs?.code === 0) {
                        return true
                      } else {
                        return false
                      }
                    }),
                  )

                  const allSuccess = rs.every((item: any) => item === true)
                  if (!allSuccess) {
                    setLoading(false)
                    return
                  }

                  toast.success({
                    title: t`Close all positions success`,
                  })
                  setLoading(false)
                  setCancelAllOrdersDialogOpen(false)

                  return
                }
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
