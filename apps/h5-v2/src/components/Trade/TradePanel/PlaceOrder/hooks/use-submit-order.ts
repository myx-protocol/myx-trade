import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useCallback, useState } from 'react'
import { useTradePanelStore } from '../../store'
import { Direction, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import useGlobalStore from '@/store/globalStore'
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
import { verifyTpSlPrice } from '@/utils/verify'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { getAsSupportedChainIdFn } from '@/config/chain'

export const useSubmitOrder = () => {
  const [longLoading, setLongLoading] = useState(false)
  const [shortLoading, setShortLoading] = useState(false)

  const { chainId: currChainId, address } = useWalletConnection()
  const chainId = getAsSupportedChainIdFn(currChainId)
  const positionList = useGetPositionList()
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const { oraclePriceData } = useMarketStore()
  const { setCloseOrderConfirmDialogOpen, setPlaceOrderConfirmDialogOpen } = useGlobalStore()
  const { checkWalletChainId } = useWalletChainCheck()
  const { getTradingFee } = useGetTradingFee(symbolInfo?.chainId)
  const { checkUserVipInfo } = useCheckUserVipInfo()
  const { poolConfig } = useGetPoolConfig(
    symbolInfo?.poolId as string,
    symbolInfo?.chainId as number,
  )

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

  const leverage = useLeverage(symbolInfo?.poolId ?? '')

  const submitOrder = useCallback(
    async (direction: Direction) => {
      if (!symbolInfo || !client) return

      await checkWalletChainId(symbolInfo.chainId as number)

      const size = direction === Direction.LONG ? longSize : shortSize

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

      let formatCollateralAmount = '0'
      if (positionAction === PositionActionEnum.OPEN) {
        formatCollateralAmount = parseBigNumber(collateralAmount)
          .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
          .toFixed(0)
        if (autoMarginMode) {
          if (amountUnit === AmountUnitEnum.BASE) {
            formatCollateralAmount = parseBigNumber(size)
              .mul(parseBigNumber(price))
              .div(leverage)
              .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
              .toFixed(0)
          } else {
            formatCollateralAmount = parseBigNumber(size)
              .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
              .div(leverage)
              .toFixed(0)
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

      const tradingFeeString = await getTradingFee({
        size: ethers.formatUnits(formatSize, symbolInfo?.baseDecimals ?? 1),
        price,
        assetClass,
      })

      const tradingFee = parseBigNumber(tradingFeeString)
        .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
        .toFixed(0)

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
            // 按用户输入的百分比计算，根据方向调整
            // 做多：盈利时价格上涨 price * (1 + change%)
            // 做空：盈利时价格下跌 price * (1 - change%)
            const changeRatio = parseBigNumber(tpValue).div(100)
            const radio =
              direction === Direction.LONG
                ? parseBigNumber(1).plus(changeRatio)
                : parseBigNumber(1).minus(changeRatio)
            const targetPrice = parseBigNumber(price).mul(radio)
            formatTpValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (tpType === TpSlTypeEnum.ROI) {
            // 按用户输入的 ROI 计算，根据方向调整
            // 做多：price + averagePnl
            // 做空：price - averagePnl
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
            // 按用户输入的盈亏金额计算，根据方向调整
            // 做多：price + averagePnl
            // 做空：price - averagePnl
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
            // 按用户输入的百分比计算，根据方向调整
            // 做多：止损时价格下跌 price * (1 - |change%|)
            // 做空：止损时价格上涨 price * (1 + |change%|)
            // 注意：用户可能输入正数或负数，都取绝对值处理
            const changeRatio = parseBigNumber(slValue).abs().div(100)
            const radio =
              direction === Direction.LONG
                ? parseBigNumber(1).minus(changeRatio)
                : parseBigNumber(1).plus(changeRatio)
            const targetPrice = parseBigNumber(price).mul(radio)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (slType === TpSlTypeEnum.ROI) {
            // 按用户输入的 ROI 计算，根据方向调整
            // 做多：price - |averagePnl|
            // 做空：price + |averagePnl|
            // 注意：用户可能输入正数或负数，都取绝对值处理
            const radio = parseBigNumber(slValue).abs().div(100)
            const totalPnl = parseBigNumber(
              ethers.formatUnits(formatCollateralAmount, symbolInfo?.quoteDecimals ?? 1),
            ).mul(radio)
            const formatAveragePnl = totalPnl.div(parseBigNumber(size))
            const averagePnl = parseBigNumber(formatAveragePnl.toFixed(10))
            const targetPrice =
              direction === Direction.LONG
                ? parseBigNumber(price).minus(averagePnl)
                : parseBigNumber(price).plus(averagePnl)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else if (slType === TpSlTypeEnum.Pnl) {
            // 按用户输入的盈亏金额计算，根据方向调整
            // 做多：price + averagePnl (averagePnl 为负)
            // 做空：price - averagePnl (averagePnl 为负，所以实际是 price + |averagePnl|)
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

      const position = positionList?.find(
        (position: any) =>
          position.poolId === symbolInfo?.poolId && position.direction === direction,
      )
      let positionId = ''

      if (position && position.tokenId) {
        positionId = position.positionId
      }

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
      }

      try {
        if (direction === Direction.LONG) {
          setLongLoading(true)
        } else {
          setShortLoading(true)
        }
        await checkUserVipInfo()
        if (positionAction === PositionActionEnum.OPEN) {
          const rs = await client?.order.createIncreaseOrder(
            orderData,
            tradingFee,
            symbolInfo?.marketId as string,
          )

          if (rs?.code === 0) {
            resetStore()
            toast.success({
              title: t`Submit open order success`,
            })
            setPlaceOrderConfirmDialogOpen(false)
            await sleep(1500)
            tradePubSub.emit('place:order:success')
          } else {
            toast.error({
              title: t`${client?.utils.formatErrorMessage(rs)}`,
            })
          }
        } else {
          const rs = await client?.order.createDecreaseOrder({
            ...orderData,
            collateralAmount: '0',
          } as any)
          if (rs?.code === 0) {
            toast.success({
              title: t`Submit close order success`,
            })
            setCloseOrderConfirmDialogOpen(false)
            resetStore()
            await sleep(1500)
            tradePubSub.emit('place:order:success')
          } else {
            toast.error({
              title: t`${client?.utils.formatErrorMessage(rs)}`,
            })
          }
        }
      } catch (error) {
        toast.error({
          title: t`${client?.utils.formatErrorMessage(error)}`,
        })
      } finally {
        if (direction === Direction.LONG) {
          setLongLoading(false)
        } else {
          setShortLoading(false)
        }
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
    ],
  )

  return {
    submitOrder,
    submitLongLoading: longLoading,
    submitShortLoading: shortLoading,
    submitLoading: longLoading || shortLoading,
  }
}
