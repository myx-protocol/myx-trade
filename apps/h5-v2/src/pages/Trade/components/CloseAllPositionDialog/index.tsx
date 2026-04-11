import { usePositionStore } from '@/store/position/createStore'
import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useState } from 'react'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import useGlobalStore from '@/store/globalStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import {
  COMMON_PRICE_DECIMALS,
  Direction,
  OperationType,
  OrderType,
  TimeInForce,
  TriggerType,
} from '@myx-trade/sdk'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { ethers } from 'ethers'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { useGetTradingFee } from '@/hooks/calculate/use-get-trading-fee'
import { parseBigNumber } from '@/utils/bn'
import { showErrorToast } from '@/config/error'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '../../types'

export const CloseAllPositionDialog = () => {
  const { closeAllPositionDialogOpen, setCloseAllPositionDialogOpen, selectChainId } =
    usePositionStore()
  const { client } = useMyxSdkClient(Number(selectChainId))
  const [loading, setLoading] = useState(false)
  const { symbolInfo } = useGlobalStore()
  const { address } = useWalletConnection()
  const { tickerData } = useMarketStore()
  const positions = useGetPositionList(true)
  const { poolList } = useGetPoolList()
  const { tradeMode } = useGlobalStore()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(symbolInfo?.chainId)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()

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
      <div className="left-0 mt-[40px] flex w-full justify-center">
        <PrimaryButton
          onClick={async () => {
            if (positions.length === 0) {
              toast.error({ title: t`No positions` })
              return
            }

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
                  positions.map(async (position: any) => {
                    const pool = poolList.find(
                      (poolItem: any) => position.poolId === poolItem?.poolId,
                    )
                    const isAuthorizedRes = await getSeamlessAuthStatus({
                      masterAddress: activeSeamlessAddress,
                      seamlessAddress: seamlessAccount.seamlessAddress,
                      chainId: position.chainId as number,
                      tokenAddress: pool?.quoteToken as string,
                    })

                    const isAuthorized = isAuthorizedRes?.data?.auth
                    return {
                      positionId: position.positionId,
                      isAuthorized: isAuthorized,
                    }
                  }),
                )

                const couldClosePositions = positions.filter((item: any) => {
                  return authData.find((authItem: any) => authItem.positionId === item.positionId)
                    ?.isAuthorized
                })

                if (couldClosePositions.length === 0) {
                  return
                }

                const positionsByChainId = couldClosePositions.reduce((acc: any, position: any) => {
                  if (acc[position.chainId]) {
                    acc[position.chainId].push(position)
                  } else {
                    acc[position.chainId] = [position]
                  }
                  return acc
                }, {})

                const dataArray = Object.keys(positionsByChainId).map((chainId) => {
                  const positions = positionsByChainId[chainId]
                  const depositData = positions.map(() => ({
                    token: '0x0000000000000000000000000000000000000000',
                    amount: '0',
                  }))
                  const positionData = positions.map((position: any) => {
                    return {
                      positionId: position.positionId,
                      data: {
                        user: position.address,
                        poolId: position.poolId,
                        orderType: position.orderType,
                        triggerType: position.triggerType,
                        operation: OperationType.DECREASE,
                        direction: position.direction,
                        collateralAmount: position.collateralAmount,
                        size: position.size,
                        price: position.price,
                        timeInForce: TimeInForce.IOC,
                        postOnly: position.postOnly,
                        slippagePct: position.slippagePct,
                        leverage: position.leverage,
                        tpSize: 0,
                        tpPrice: 0,
                        slSize: 0,
                        slPrice: 0,
                        broker: getMyxBrokerAddressByChainId(position.chainId as number),
                      },
                    }
                  })
                  return {
                    chainId,
                    depositData,
                    positionData,
                  }
                })

                const rs = await Promise.all(
                  dataArray.map(async (item: any) => {
                    const { depositData, positionData, chainId } = item
                    const pool = poolList.find(
                      (poolItem: any) => positionData[0].poolId === poolItem?.poolId,
                    )
                    const forwardRs = await forwardSeamlessTransaction({
                      chainId: chainId as number,
                      masterAddress: activeSeamlessAddress,
                      seamlessAddress: seamlessAccount.seamlessAddress,
                      forwardFeeToken: pool?.quoteToken as string,
                      functionName: 'placeOrdersWithPosition',
                      orderParams: [
                        depositData,
                        positionData.map((item: any) => item.positionId),
                        positionData.map((item: any) => item.data),
                      ],
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
                setCloseAllPositionDialogOpen(false)
                return
              }
              const data = positions.map((position: any) => {
                const pool = poolList.find((poolItem: any) => position.poolId === poolItem?.poolId)

                const marketPrice = tickerData[position.poolId]?.price.toString() ?? '0'
                const closePositionSlippage = getSlippage({
                  chainId: position?.chainId ?? 0,
                  poolId: position?.poolId ?? '',
                  type: SlippageTypeEnum.CLOSE,
                })

                return {
                  chainId: position.chainId as number,
                  address: address as `0x${string}`,
                  poolId: position?.poolId as string,
                  positionId: position?.positionId as string,
                  orderType: OrderType.MARKET,
                  triggerType: TriggerType.NONE,
                  direction: position.direction as Direction,
                  collateralAmount: '0',
                  size: ethers.parseUnits(position.size.toString(), pool?.baseDecimals).toString(),
                  price: ethers.parseUnits(marketPrice, COMMON_PRICE_DECIMALS).toString(),
                  timeInForce: TimeInForce.IOC,
                  postOnly: false,
                  slippagePct: ethers
                    .parseUnits((closePositionSlippage ?? 0).toString(), 4)
                    .toString(), // 转换为精度4位
                  executionFeeToken: symbolInfo?.quoteToken as string,
                  leverage: position.userLeverage,
                  tpSize: '0',
                  tpPrice: '0',
                  slSize: '0',
                  slPrice: '0',
                }
              })

              const rs = await client?.order.closeAllPositions(Number(selectChainId), data)

              if (rs?.code === 0) {
                toast.success({ title: t`Close all positions success` })
                setCloseAllPositionDialogOpen(false)
              } else {
                showErrorToast(client?.utils.formatErrorMessage(rs))
              }
            } catch (error) {
              showErrorToast(error)
            } finally {
              setLoading(false)
            }
          }}
          className="w-full"
          loading={loading}
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
