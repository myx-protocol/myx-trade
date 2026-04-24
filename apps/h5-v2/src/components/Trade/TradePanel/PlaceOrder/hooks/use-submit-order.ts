import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useCallback, useState } from 'react'
import { useTradePanelStore } from '../../store'
import {
  Direction,
  MarketPoolState,
  OperationType,
  OrderType,
  TimeInForce,
  TriggerType,
} from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { ethers } from 'ethers'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { AmountUnitEnum, PositionActionEnum, TpSlTypeEnum } from '@/components/Trade/type'
import { parseBigNumber } from '@/utils/bn'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { sleep } from '@/utils'
import { tradePubSub } from '@/utils/pubsub'
import { useGetTradingFee } from '@/hooks/calculate/use-get-trading-fee'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { getSlippage } from '@/utils/slippage'
import { SlippageTypeEnum } from '@/utils/slippage'
import useGlobalStore from '@/store/globalStore'
import { verifyTpSlPrice } from '@/utils/verify'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { showErrorToast } from '@/config/error'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '@/pages/Trade/types'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { useGetAllQuoteTokenAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { useGetPositionAvailableMargin } from '@/hooks/available/use-get-position-available-margin'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'
import { buildSubmitOrderToastParts, renderOrderToastContent } from '@/utils/order/action-toast'
// import { useGetPositionAvailableMargin } from '@/hooks/available/use-get-position-available-margin'

export const useSubmitOrder = () => {
  const [loading, setLoading] = useState(false)
  const [longLoading, setLongLoading] = useState(false)
  const [shortLoading, setShortLoading] = useState(false)
  const { chainId, address } = useWalletConnection()
  const positionList = useGetPositionList()
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const { oraclePriceData } = useMarketStore()
  const { setCloseOrderConfirmDialogOpen, setPlaceOrderConfirmDialogOpen } = useGlobalStore()
  const { checkWalletChainId } = useWalletChainCheck()
  const { getTradingFee } = useGetTradingFee(symbolInfo?.chainId)
  const [longAsyncVipLoading, setLongAsyncVipLoading] = useState(false)
  const [shortAsyncVipLoading, setShortAsyncVipLoading] = useState(false)
  const { tradeMode } = useGlobalStore()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { poolConfig } = useGetPoolConfig(
    symbolInfo?.poolId as string,
    symbolInfo?.chainId as number,
  )
  const { shareCollateral } = useGlobalStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(symbolInfo?.chainId)
  const { longPositionAvailableMargin, shortPositionAvailableMargin } =
    useGetPositionAvailableMargin(symbolInfo?.poolId as string, symbolInfo?.chainId as number)

  const { isMatch, asyncVipInfo, asyncVipLevelLoading } = useCheckUserVipInfo()

  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0

  const marketPrice = oraclePriceData[symbolInfo?.poolId as string]?.price ?? 0
  const {
    longSize,
    shortSize,
    amountUnit,
    price,
    orderType,
    collateralAmount,
    autoMarginMode,
    positionAction,
    tpValue,
    slValue,
    tpType,
    slType,
    resetStore,
    tpSlOpen,
  } = useTradePanelStore()
  const { quoteTokenAuthStatus } = useGetAllQuoteTokenAuthStatus()
  const leverage = useLeverage(symbolInfo?.poolId ?? '')

  const submitOrder = useCallback(
    async (direction: Direction) => {
      if (!symbolInfo || !client) return

      if (
        symbolInfo.state === MarketPoolState.PreBench &&
        positionAction === PositionActionEnum.OPEN
      ) {
        toast.error({
          title: t`Delisting soon. Only closing positions is allowed`,
        })
        return
      }

      await checkWalletChainId(symbolInfo.chainId as number)

      const position = positionList?.find(
        (position: any) =>
          position.poolId === symbolInfo?.poolId && position.direction === direction,
      )
      let positionId = ''

      if (position && position.tokenId) {
        positionId = position.positionId
      }

      const size = direction === Direction.LONG ? longSize : shortSize
      const displaySize =
        amountUnit === AmountUnitEnum.BASE
          ? size
          : parseBigNumber(size)
              .div(parseBigNumber(price || '1'))
              .toString()

      let formatTriggerType: TriggerType = TriggerType.NONE

      if (orderType === OrderType.LIMIT) {
        if (positionAction === PositionActionEnum.OPEN) {
          if (direction === Direction.LONG) {
            formatTriggerType = TriggerType.LTE
          } else {
            formatTriggerType = TriggerType.GTE
          }
        } else {
          if (direction === Direction.LONG) {
            formatTriggerType = TriggerType.GTE
          } else {
            formatTriggerType = TriggerType.LTE
          }
        }
      }

      let formatSize = '0'

      if (amountUnit === AmountUnitEnum.BASE) {
        formatSize = parseBigNumber(size)
          .mul(10 ** (symbolInfo?.baseDecimals ?? 1))
          .toFixed(0)
      } else {
        formatSize = parseBigNumber(size)
          .div(parseBigNumber(price))
          .mul(10 ** (symbolInfo?.baseDecimals ?? 1))
          .toFixed(0)
      }

      const networkFee = await client?.utils.getNetworkFee(
        symbolInfo?.marketId as string,
        symbolInfo.chainId as number,
      )

      let formatCollateralAmount = '0'
      const positionAvailableMargin =
        direction === Direction.LONG ? longPositionAvailableMargin : shortPositionAvailableMargin
      const parsedPositionAvailableMarginString = parseBigNumber(positionAvailableMargin)
        .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
        .toFixed(0)
      const parsedPositionAvailableMargin = parseBigNumber(parsedPositionAvailableMarginString)

      let totalNetworkFee = parseBigNumber(0)
      if (positionAction === PositionActionEnum.OPEN) {
        totalNetworkFee = parseBigNumber(networkFee)
        if (tpSlOpen && tpValue && !parseBigNumber(tpValue).eq(0)) {
          totalNetworkFee = totalNetworkFee.plus(parseBigNumber(networkFee))
        }

        if (tpSlOpen && slValue && !parseBigNumber(slValue).eq(0)) {
          totalNetworkFee = totalNetworkFee.plus(parseBigNumber(networkFee))
        }
      }

      const tradingFeeString = await getTradingFee({
        size: ethers.formatUnits(formatSize, symbolInfo?.baseDecimals ?? 1),
        price,
        assetClass,
      })

      const tradingFee = parseBigNumber(tradingFeeString)
        .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
        .toFixed(0)

      if (positionAction === PositionActionEnum.OPEN) {
        formatCollateralAmount = parseBigNumber(collateralAmount)
          .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
          .toFixed(0)

        if (!shareCollateral) {
          if (autoMarginMode) {
            let parsedCollateral = parseBigNumber(size)
              .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
              .div(leverage)

            if (amountUnit === AmountUnitEnum.BASE) {
              parsedCollateral = parsedCollateral.mul(parseBigNumber(price))
            }

            formatCollateralAmount = parsedCollateral.plus(parseBigNumber(tradingFee)).toFixed(0)
          }
        } else {
          if (autoMarginMode) {
            if (amountUnit === AmountUnitEnum.BASE) {
              const needMargin = parseBigNumber(size)
                .mul(parseBigNumber(price))
                .div(leverage)
                .plus(parseBigNumber(tradingFee))

              if (needMargin.lt(parsedPositionAvailableMargin)) {
                formatCollateralAmount = '0'
              } else {
                formatCollateralAmount = needMargin
                  .minus(parsedPositionAvailableMargin)
                  .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
                  .toFixed(0)
              }
            } else {
              const needMargin = parseBigNumber(size).div(leverage).plus(parseBigNumber(tradingFee))
              if (needMargin.lt(parsedPositionAvailableMargin)) {
                formatCollateralAmount = '0'
              } else {
                formatCollateralAmount = needMargin
                  .minus(parsedPositionAvailableMargin)
                  .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
                  .toFixed(0)
              }
            }
          }
        }
      } else {
        const positionSize = direction === Direction.LONG ? longSize : shortSize
        const baseSize =
          amountUnit === AmountUnitEnum.BASE
            ? parseBigNumber(positionSize)
            : parseBigNumber(positionSize).div(parseBigNumber(price))

        if (position && !parseBigNumber(position.size).eq(baseSize)) {
          let diff = parseBigNumber(0)
          if (parsedPositionAvailableMargin.lt(parseBigNumber(networkFee))) {
            diff = parseBigNumber(networkFee).minus(parsedPositionAvailableMargin)
          }

          formatCollateralAmount = parseBigNumber(networkFee).plus(diff).toFixed(0)
        }
      }

      if (!position || parsedPositionAvailableMargin.gt(networkFee)) {
        formatCollateralAmount = parseBigNumber(formatCollateralAmount)
          .plus(parseBigNumber(networkFee))
          .toFixed()
      }

      const openPositionSlippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.OPEN,
      })
      const closePositionSlippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.CLOSE,
      })

      const slippagePct = ethers
        .parseUnits(
          positionAction === PositionActionEnum.OPEN
            ? parseBigNumber(openPositionSlippage ?? '0')
                .toFixed(4)
                .toString()
            : parseBigNumber(closePositionSlippage ?? '0')
                .toFixed(4)
                .toString(),
          4,
        )
        .toString()

      let formatTpValue = '0'
      let formatSlValue = '0'
      let formatTpSize = '0'
      let formatSlSize = '0'
      if (positionAction === PositionActionEnum.OPEN) {
        formatTpValue = tpValue
          ? ethers.parseUnits((tpValue ?? '0').toString(), 30).toString()
          : '0'
        formatSlValue = slValue
          ? ethers.parseUnits((slValue ?? '0').toString(), 30).toString()
          : '0'
        formatTpSize = '0'
        formatSlSize = '0'

        if (tpSlOpen && tpValue && !parseBigNumber(tpValue).eq(0)) {
          formatTpSize = formatSize
          if (tpType === TpSlTypeEnum.Change) {
            const radio = parseBigNumber(1).plus(parseBigNumber(tpValue).div(100))
            const targetPrice = parseBigNumber(price).mul(radio)
            formatTpValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (tpType === TpSlTypeEnum.ROI) {
            const radio = parseBigNumber(tpValue).div(100)
            const targetCollateral = parseBigNumber(
              ethers.formatUnits(formatCollateralAmount, symbolInfo?.quoteDecimals ?? 1),
            )
            const totalPnl = targetCollateral.mul(radio)

            const formatAveragePnl = totalPnl.div(parseBigNumber(size))
            const averagePnl = parseBigNumber(formatAveragePnl.toFixed(10))
            const targetPrice =
              direction === Direction.LONG
                ? parseBigNumber(price).plus(averagePnl)
                : parseBigNumber(price).minus(averagePnl)
            formatTpValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (tpType === TpSlTypeEnum.Pnl) {
            const totalPnl = parseBigNumber(tpValue)
            const formatAveragePnl = totalPnl.div(parseBigNumber(size))
            const averagePnl = parseBigNumber(formatAveragePnl.toFixed(10))
            const targetPrice =
              direction === Direction.LONG
                ? parseBigNumber(price).plus(averagePnl)
                : parseBigNumber(price).minus(averagePnl)
            formatTpValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          }
        }

        if (tpSlOpen && slValue && !parseBigNumber(slValue).eq(0)) {
          formatSlSize = formatSize
          if (slType === TpSlTypeEnum.Change) {
            const radio =
              direction === Direction.LONG
                ? parseBigNumber(1).plus(parseBigNumber(slValue).div(100))
                : parseBigNumber(1).minus(parseBigNumber(slValue).div(100))
            const targetPrice = parseBigNumber(price).mul(radio)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (slType === TpSlTypeEnum.ROI) {
            const radio = parseBigNumber(slValue).div(100)
            const totalPnl = parseBigNumber(
              ethers.formatUnits(formatCollateralAmount, symbolInfo?.quoteDecimals ?? 1),
            ).mul(radio)
            const formatAveragePnl = totalPnl.div(parseBigNumber(size))
            const averagePnl = parseBigNumber(formatAveragePnl.toFixed(10))
            const targetPrice =
              direction === Direction.LONG
                ? parseBigNumber(price).plus(averagePnl)
                : parseBigNumber(price).minus(averagePnl)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (slType === TpSlTypeEnum.Pnl) {
            const totalPnl = parseBigNumber(slValue)
            const formatAveragePnl = totalPnl.div(parseBigNumber(size))
            const averagePnl = parseBigNumber(formatAveragePnl.toFixed(10))
            const targetPrice =
              direction === Direction.LONG
                ? parseBigNumber(price).plus(averagePnl)
                : parseBigNumber(price).minus(averagePnl)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          }
        }

        if (parseBigNumber(formatTpSize).gt(0)) {
          const tpVerify = verifyTpSlPrice(
            ethers.parseUnits(price, 30).toString(),
            formatTpValue,
            direction,
            'tp',
          )
          if (!tpVerify) {
            return
          }
        }

        if (parseBigNumber(formatSlSize).gt(0)) {
          const slVerify = verifyTpSlPrice(
            ethers.parseUnits(price, 30).toString(),
            formatSlValue,
            direction,
            'sl',
          )
          if (!slVerify) {
            return
          }
        }
      }

      const placeOrderSaltAsOne = ethers.zeroPadValue(ethers.toBeHex(1n), 32)

      const orderData = {
        chainId: symbolInfo.chainId as number,
        address: address as `0x${string}`,
        poolId: symbolInfo?.poolId as string,
        positionId,
        orderType: orderType as OrderType,
        triggerType: formatTriggerType as TriggerType,
        direction: direction,
        collateralAmount: formatCollateralAmount as string,
        size: formatSize,
        price: ethers.parseUnits(price, 30).toString(),
        timeInForce: TimeInForce.IOC,
        postOnly: false,
        slippagePct, // 转换为精度4位
        executionFeeToken: symbolInfo?.quoteToken as string,
        leverage: leverage,
        tpSize: formatTpSize,
        tpPrice: formatTpValue,
        slSize: formatSlSize,
        slPrice: formatSlValue,
        broker: getMyxBrokerAddressByChainId(symbolInfo.chainId as number),
      }

      try {
        setLoading(true)

        if (!isMatch) {
          if (direction === Direction.LONG) {
            setLongAsyncVipLoading(true)
          } else {
            setShortAsyncVipLoading(true)
          }

          const rs = await asyncVipInfo(symbolInfo?.quoteToken as string, symbolInfo?.chainId ?? '')

          if (!rs) {
            setLoading(false)
            setLongAsyncVipLoading(false)
            setShortAsyncVipLoading(false)
            return
          }

          if (direction === Direction.LONG) {
            setLongAsyncVipLoading(false)
          } else {
            setShortAsyncVipLoading(false)
          }
        }

        if (direction === Direction.LONG) {
          setLongLoading(true)
        } else {
          setShortLoading(true)
        }

        if (positionAction === PositionActionEnum.OPEN) {
          if (tradeMode === TradeMode.Seamless) {
            const seamlessAccount = seamlessAccountList.find(
              (item) => item.masterAddress === activeSeamlessAddress,
            )
            if (!seamlessAccount) {
              return
            }
            const isSeamlessAuthorized = quoteTokenAuthStatus.find(
              (item) => item.quoteToken === symbolInfo?.quoteToken,
            )?.auth

            if (isSeamlessAuthorized) {
              const availableRes = await client.account.getAvailableMarginBalance({
                poolId: symbolInfo.poolId,
                chainId: symbolInfo.chainId,
                address: seamlessAccount.masterAddress,
              })
              const availableAccountMarginBalance =
                availableRes.code === 0 ? (availableRes.data ?? 0n) : 0n

              const needAmount = parseBigNumber(formatCollateralAmount).plus(totalNetworkFee)
              let depositAmount = parseBigNumber(0)

              const diff = needAmount.minus(
                parseBigNumber(availableAccountMarginBalance.toString()),
              )

              if (diff.gt(0)) {
                depositAmount = diff
              }

              const depositData = {
                token: symbolInfo?.quoteToken as string,
                amount: depositAmount.toString(),
              }

              const rs = await forwardSeamlessTransaction({
                chainId: symbolInfo.chainId as number,
                masterAddress: activeSeamlessAddress,
                seamlessAddress: seamlessAccount.seamlessAddress,
                forwardFeeToken: symbolInfo?.quoteToken as string,
                functionName: positionId ? 'placeOrderWithPosition' : 'placeOrderWithSalt',
                orderParams: [
                  positionId ? positionId : placeOrderSaltAsOne.toString(),
                  depositData,
                  {
                    user: orderData.address,
                    poolId: orderData.poolId,
                    orderType: orderData.orderType,
                    triggerType: orderData.triggerType,
                    operation: OperationType.INCREASE,
                    direction: orderData.direction,
                    collateralAmount: formatCollateralAmount.toString(),
                    size: orderData.size,
                    price: orderData.price,
                    timeInForce: TimeInForce.IOC,
                    postOnly: orderData.postOnly ?? false,
                    slippagePct: orderData.slippagePct ?? '0',
                    leverage: orderData.leverage ?? 0,
                    tpSize: orderData.tpSize ?? '0',
                    tpPrice: orderData.tpPrice ?? '0',
                    slSize: orderData.slSize ?? '0',
                    slPrice: orderData.slPrice ?? '0',
                    broker: getMyxBrokerAddressByChainId(symbolInfo.chainId as number),
                  },
                ],
              })

              if (rs?.code === 0) {
                resetStore()
                const _parts = buildSubmitOrderToastParts({
                  isIncrease: true,
                  direction,
                  size: displaySize,
                  price,
                  orderType: orderType as any,
                  baseSymbol: symbolInfo.baseSymbol,
                  quoteSymbol: symbolInfo.quoteSymbol,
                })
                toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                setPlaceOrderConfirmDialogOpen(false)
                await sleep(1500)
                tradePubSub.emit('place:order:success')
              } else {
                showErrorToast(client?.utils.formatErrorMessage(rs))
              }
              return
            }
          }

          const rs = await client?.order.createIncreaseOrder(
            { ...orderData, positionId },
            totalNetworkFee.toString(),
          )
          if (rs?.code === 0) {
            resetStore()
            const _parts = buildSubmitOrderToastParts({
              isIncrease: true,
              direction,
              size: displaySize,
              price,
              orderType: orderType as any,
              baseSymbol: symbolInfo.baseSymbol,
              quoteSymbol: symbolInfo.quoteSymbol,
            })
            toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
            setPlaceOrderConfirmDialogOpen(false)
            await sleep(1500)
            tradePubSub.emit('place:order:success')
          } else {
            showErrorToast(client?.utils.formatErrorMessage(rs))
          }
        } else {
          if (tradeMode === TradeMode.Seamless) {
            const seamlessAccount = seamlessAccountList.find(
              (item) => item.masterAddress === activeSeamlessAddress,
            )
            if (!seamlessAccount) {
              return
            }

            const isSeamlessAuthorized = quoteTokenAuthStatus.find(
              (item) => item.quoteToken === symbolInfo?.quoteToken,
            )?.auth

            if (isSeamlessAuthorized) {
              const rs = await forwardSeamlessTransaction({
                chainId: symbolInfo.chainId as number,
                masterAddress: activeSeamlessAddress,
                seamlessAddress: seamlessAccount.seamlessAddress,
                forwardFeeToken: symbolInfo?.quoteToken as string,
                functionName: positionId ? 'placeOrderWithPosition' : 'placeOrderWithSalt',
                orderParams: [
                  positionId ? positionId : placeOrderSaltAsOne.toString(),
                  {
                    token: symbolInfo?.quoteToken as string,
                    amount: '0',
                  },
                  {
                    user: orderData.address,
                    poolId: orderData.poolId,
                    orderType: orderData.orderType,
                    triggerType: orderData.triggerType,
                    operation: OperationType.DECREASE,
                    direction: orderData.direction,
                    collateralAmount: '0',
                    size: orderData.size,
                    price: orderData.price,
                    timeInForce: TimeInForce.IOC,
                    postOnly: orderData.postOnly ?? false,
                    slippagePct: orderData.slippagePct ?? '0',
                    leverage: orderData.leverage ?? 0,
                    tpSize: '0',
                    tpPrice: '0',
                    slSize: '0',
                    slPrice: '0',
                    broker: getMyxBrokerAddressByChainId(symbolInfo.chainId as number),
                  },
                ],
              })

              if (rs?.code === 0) {
                const _parts = buildSubmitOrderToastParts({
                  isIncrease: false,
                  direction,
                  size: displaySize,
                  price,
                  orderType: orderType as any,
                  baseSymbol: symbolInfo.baseSymbol,
                  quoteSymbol: symbolInfo.quoteSymbol,
                })
                toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                setCloseOrderConfirmDialogOpen(false)
                resetStore()
                await sleep(1500)
                tradePubSub.emit('place:order:success')
              } else {
                showErrorToast(client?.utils.formatErrorMessage(rs))
              }

              return
            }
          }

          const rs = await client?.order.createDecreaseOrder({
            ...orderData,
            collateralAmount: '0',
          } as any)
          if (rs?.code === 0) {
            const _parts = buildSubmitOrderToastParts({
              isIncrease: false,
              direction,
              size: displaySize,
              price,
              orderType: orderType as any,
              baseSymbol: symbolInfo.baseSymbol,
              quoteSymbol: symbolInfo.quoteSymbol,
            })
            toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
            setCloseOrderConfirmDialogOpen(false)
            resetStore()
            await sleep(1500)
            tradePubSub.emit('place:order:success')
          } else {
            console.log('submit error-->', rs.message)

            showErrorToast(client?.utils.formatErrorMessage(rs))
          }
        }
      } catch (error) {
        console.log('submit error-->', error)
        showErrorToast(error)
      } finally {
        if (direction === Direction.LONG) {
          setLongLoading(false)
        } else {
          setShortLoading(false)
        }
        setLoading(false)
      }
    },
    [
      longSize,
      shortSize,
      amountUnit,
      orderType,
      collateralAmount,
      price,
      collateralAmount,
      price,
      leverage,
      symbolInfo,
      chainId,
      address,
      autoMarginMode,
      marketPrice,
      tpValue,
      slValue,
      tpType,
      slType,
      checkWalletChainId,
      resetStore,
      tpSlOpen,
      longLoading,
      shortLoading,
      setLongLoading,
      setShortLoading,
    ],
  )

  return {
    submitOrder,
    longAsyncVipLoading,
    shortAsyncVipLoading,
    submitLoading: loading,
    submitLoadingLong: longLoading,
    submitLoadingShort: shortLoading,
  }
}
