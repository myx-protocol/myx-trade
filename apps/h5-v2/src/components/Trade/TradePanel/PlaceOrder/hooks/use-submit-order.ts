import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useCallback } from 'react'
import { useTradePanelStore } from '../../store'
import { Direction, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { ethers } from 'ethers'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { AmountUnitEnum, PositionActionEnum, TpSlTypeEnum } from '@/components/Trade/type'
import { parseBigNumber } from '@/utils/bn'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { toast } from 'react-hot-toast'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { sleep } from '@/utils'
import { tradePubSub } from '@/utils/pubsub'

export const useSubmitOrder = () => {
  const { client } = useMyxSdkClient()
  const { chainId, address } = useWalletConnection()
  const { symbolInfo } = useTradePageStore()
  const { oraclePriceData } = useMarketStore()
  const { checkWalletChainId } = useWalletChainCheck()
  const marketPrice = oraclePriceData[symbolInfo?.poolId as string]?.price ?? 0
  const {
    longSize,
    shortSize,
    amountUnit,
    price,
    orderType,
    collateralAmount,
    openPositionSlippage,
    autoMarginMode,
    closePositionSlippage,
    positionAction,
    tpValue,
    slValue,
    tpType,
    slType,
  } = useTradePanelStore()

  const leverage = useLeverage(symbolInfo?.poolId ?? '')

  const submitOrder = useCallback(
    async (direction: Direction) => {
      if (!symbolInfo) return

      await checkWalletChainId(symbolInfo.chainId as number)

      let size = '0'
      if (direction === Direction.LONG) {
        size = longSize
      } else {
        size = shortSize ?? '0'
      }

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
          formatCollateralAmount = parseBigNumber(size)
            .mul(parseBigNumber(price))
            .div(leverage)
            .mul(10 ** (symbolInfo?.quoteDecimals ?? 1))
            .toFixed(0)
        }
      }

      let formatSize = '0'
      console.log('amountUnit-->', amountUnit, longSize, shortSize)

      if (amountUnit === AmountUnitEnum.BASE) {
        console.log('size-->', size)
        formatSize = parseBigNumber(size)
          .mul(10 ** (symbolInfo?.baseDecimals ?? 1))
          .toFixed(0)
      } else {
        formatSize = parseBigNumber(size)
          .div(parseBigNumber(price))
          .mul(10 ** (symbolInfo?.baseDecimals ?? 1))
          .toFixed(0)
      }

      const slippagePct = ethers
        .parseUnits(
          positionAction === PositionActionEnum.OPEN
            ? openPositionSlippage.toString()
            : closePositionSlippage.toString(),
          4,
        )
        .toString()

      let formatTpValue = ethers.parseUnits(tpValue.toString(), 30).toString()
      let formatSlValue = ethers.parseUnits(slValue.toString(), 30).toString()
      let formatTpSize = '0'
      let formatSlSize = '0'

      if (tpValue && !parseBigNumber(tpValue).eq(0)) {
        formatTpSize = formatSize
        if (tpType === TpSlTypeEnum.Change) {
          const radio = parseBigNumber(1).plus(parseBigNumber(tpValue).div(100)) //new BigNumber(1).plus(new BigNumber(tp).div(100))
          formatTpValue = parseBigNumber(price).mul(radio).toString()
        } else if (tpType === TpSlTypeEnum.ROI) {
          const radio = parseBigNumber(1).plus(parseBigNumber(tpValue).div(100))
          const targetCollateral = parseBigNumber(collateralAmount).mul(radio)
          const totalPnl = targetCollateral.minus(parseBigNumber(collateralAmount))
          const averagePnl = totalPnl.div(parseBigNumber(size))
          const targetPrice = parseBigNumber(price).plus(
            direction === Direction.LONG ? averagePnl : averagePnl.mul(-1),
          )
          formatTpValue = ethers.parseUnits(targetPrice.toString(), 30).toString()
        } else if (tpType === TpSlTypeEnum.Pnl) {
          const totalPnl = parseBigNumber(tpValue)
          const averagePnl = totalPnl.div(parseBigNumber(size))
          if (direction === Direction.LONG) {
            const targetPrice = parseBigNumber(price).plus(averagePnl)
            formatTpValue = ethers.parseUnits(targetPrice.toString(), 30).toString()
          } else {
            const targetPrice = parseBigNumber(price).minus(averagePnl)
            formatTpValue = ethers.parseUnits(targetPrice.toString(), 30).toString()
          }
        }
      }

      if (slValue && !parseBigNumber(slValue).eq(0)) {
        formatSlSize = formatSize
        if (slType === TpSlTypeEnum.Change) {
          const radio = parseBigNumber(1).plus(parseBigNumber(slValue).div(100))
          const targetPrice = parseBigNumber(price).mul(radio).gt(0)
            ? parseBigNumber(price).mul(radio).toString()
            : '0'
          formatSlValue = ethers.parseUnits(targetPrice, 30).toString()
        } else if (slType === TpSlTypeEnum.ROI) {
          let radio = parseBigNumber(1)
          if (direction === Direction.LONG) {
            radio = parseBigNumber(1).plus(parseBigNumber(slValue).div(100))
          } else {
            radio = parseBigNumber(1).minus(parseBigNumber(slValue).div(100))
          }

          const targetCollateral = parseBigNumber(collateralAmount).mul(radio)
          const totalPnl = targetCollateral.minus(parseBigNumber(collateralAmount))
          const averagePnl = totalPnl.div(parseBigNumber(size))
          const targetPrice = parseBigNumber(price).plus(averagePnl)
          formatSlValue = ethers.parseUnits(targetPrice.toString(), 30).toString()
        } else if (slType === TpSlTypeEnum.Pnl) {
          const totalPnl = parseBigNumber(slValue)
          const averagePnl = totalPnl.div(parseBigNumber(size))
          if (direction === Direction.LONG) {
            const targetPrice = parseBigNumber(price).minus(averagePnl)
            formatSlValue = targetPrice.gt(0)
              ? ethers.parseUnits(targetPrice.toString(), 30).toString()
              : '0'
          } else {
            const targetPrice = parseBigNumber(price).plus(averagePnl)
            formatSlValue = ethers.parseUnits(targetPrice.toString(), 30).toString()
          }
        }
      }

      // return

      const orderData = {
        chainId: symbolInfo.chainId as number,
        address: address as `0x${string}`,
        poolId: symbolInfo?.poolId as string,
        userPositionSalt: 1,
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
        tpPrice: ethers.parseUnits(formatTpValue, 30).toString(),
        slSize: formatSlSize,
        slPrice: ethers.parseUnits(formatSlValue, 30).toString(),
      }

      if (positionAction === PositionActionEnum.OPEN) {
        const rs = await client?.order.createIncreaseOrder(orderData)
        console.log('rs-->', rs)
        if (rs?.code === 0) {
          toast.success('Submit open order success')
          // wait backend sync data
          await sleep(1500)
          tradePubSub.emit('place:order:success')
        } else {
          toast.error('Submit open order failed')
        }
      } else {
        const rs = await client?.order.createDecreaseOrder(orderData)
        console.log('rs-->', rs)
        if (rs?.code === 0) {
          toast.success('Submit close order success')
          // wait backend sync data
          await sleep(1500)
          tradePubSub.emit('place:order:success')
        } else {
          toast.error('Submit close order failed')
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
    ],
  )

  return {
    submitOrder,
  }
}
