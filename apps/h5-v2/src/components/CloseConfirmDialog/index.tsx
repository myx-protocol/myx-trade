import { Trans } from '@lingui/react/macro'

import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useMemo } from 'react'
import { Direction } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import { formatNumber } from '@/utils/number'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import useGlobalStore from '@/store/globalStore'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { AmountUnitEnum } from '@/components/Trade/type'
import { setSlippage as setSlippageAction } from '@/utils/slippage'
import { EditText } from '@/components/EditText'
import { useSubmitOrder } from '@/components/Trade/TradePanel/PlaceOrder/hooks/use-submit-order'

export const CloseConfirmDialog = () => {
  const { longSize, shortSize, price, amountUnit } = useTradePanelStore()
  const { submitOrder, submitLoading } = useSubmitOrder()
  const { symbolInfo } = useTradePageStore()

  const {
    setCloseOrderConfirmDialogOpen,
    closeOrderConfirmDialogOpen,
    showCloseOrderConfirmDialog,
  } = useGlobalStore()
  const closePositionSlippage = getSlippage({
    chainId: symbolInfo?.chainId ?? 0,
    poolId: symbolInfo?.poolId ?? '',
    type: SlippageTypeEnum.CLOSE,
  })

  const direction = closeOrderConfirmDialogOpen === 'LONG' ? Direction.LONG : Direction.SHORT
  const formatOriginSize = direction === Direction.LONG ? longSize : shortSize
  let formatSize = formatOriginSize
  if (amountUnit === AmountUnitEnum.QUOTE) {
    formatSize = parseBigNumber(longSize).div(parseBigNumber(price)).toString()
  }
  const closeAmount = formatNumber(formatSize ?? '0', { showUnit: false }) ?? '0'

  const positionList = useGetPositionList()
  const position = positionList?.find(
    (item: any) => item.poolId === symbolInfo?.poolId && item.direction === direction,
  )

  const pnl = useMemo(() => {
    if (!position || parseBigNumber(price).eq(0)) return '0'
    if (direction === Direction.LONG) {
      const size =
        amountUnit === AmountUnitEnum.BASE
          ? longSize
          : parseBigNumber(longSize).div(parseBigNumber(price))
      return parseBigNumber(price).minus(parseBigNumber(position.entryPrice)).mul(size) ?? '0'
    } else {
      const size =
        amountUnit === AmountUnitEnum.BASE
          ? longSize
          : parseBigNumber(longSize).div(parseBigNumber(price))
      return parseBigNumber(position.entryPrice).minus(parseBigNumber(price)).mul(size) ?? '0'
    }
  }, [price, position?.entryPrice, longSize, shortSize, position?.direction])

  return (
    <DialogBase
      title={direction === Direction.LONG ? t`Close Long` : t`Close Short`}
      open={showCloseOrderConfirmDialog}
      onClose={() => setCloseOrderConfirmDialogOpen(false)}
    >
      <div className="mt-[10px] flex items-center gap-[4px] text-[16px] leading-[16px] text-[#EC605A]">
        <p>
          {symbolInfo?.baseSymbol}/{symbolInfo?.quoteSymbol}
        </p>
        <p>{position?.userLeverage}x</p>
      </div>
      <div className="mt-[20px] flex items-center justify-between">
        <p className="text-[14px] text-[#848E9C]">
          <Trans>Closeable Amount</Trans>
        </p>
        <p className="text-[14px] font-[500] text-[white]">
          {closeAmount} {symbolInfo?.baseSymbol}
        </p>
      </div>
      <div className="mt-[12px] flex items-center justify-between">
        <p className="text-[14px] text-[#848E9C]">
          <Trans>Current Price</Trans>
        </p>
        <p className="text-[14px] font-[500] text-[white]">
          {formatNumber(price, { showUnit: false })}
        </p>
      </div>
      <div className="mt-[12px] flex items-center justify-between">
        <p className="text-[14px] text-[#848E9C]">
          <Trans>Est. Slippage</Trans>
        </p>
        <div className="flex items-center gap-[4px]">
          <EditText
            value={`${((closePositionSlippage ?? 0) * 100).toFixed(2)}`}
            unit="%"
            onChange={(newSlippage) => {
              setSlippageAction({
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
                type: SlippageTypeEnum.CLOSE,
                slippage: parseBigNumber(newSlippage).div(100).toNumber(),
              })
            }}
          />
        </div>
      </div>
      <div className="mt-[12px] flex items-center justify-between">
        <p className="text-[14px] text-[#848E9C]">
          <Trans>Est. Pnl</Trans>
        </p>
        <p
          className="text-[14px] font-[500]"
          style={{ color: parseBigNumber(pnl).gt(0) ? '#00E3A5' : '#EC605A' }}
        >
          {formatNumber(pnl.toString(), { showUnit: false })} {symbolInfo?.quoteSymbol}
        </p>
      </div>

      <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
        <PrimaryButton
          loading={submitLoading}
          onClick={async () => {
            // try {
            // setLoading(true)
            await submitOrder(direction)
            // const rs = await client?.order.createDecreaseOrder({
            //   chainId: position?.chainId,
            //   address: address as `0x${string}`,
            //   poolId: position?.poolId,
            //   positionId: position?.tokenId ? position?.positionId : '',
            //   orderType: OrderType.MARKET,
            //   triggerType: TriggerType.NONE,
            //   direction: position?.direction,
            //   collateralAmount: '0',
            //   size: ethers
            //     .parseUnits(
            //       parseBigNumber(closeAmount ?? '0').toFixed(symbolInfo?.baseDecimals ?? 1),
            //       symbolInfo?.baseDecimals,
            //     )
            //     .toString(),
            //   price: ethers.parseUnits(price.toString(), 30).toString(),
            //   timeInForce: TimeInForce.IOC,
            //   postOnly: false,
            //   slippagePct: ethers
            //     .parseUnits((closePositionSlippage ?? 0).toString(), 4)
            //     .toString(), // 转换为精度4位
            //   executionFeeToken: symbolInfo?.quoteToken as string,
            //   leverage: position.userLeverage,
            // })
            // if (rs?.code === 0) {
            //   toast.success({ title: t`Close position success` })
            //   resetStore()
            //   setCloseOrderConfirmDialogOpen(false)
            // } else {
            //   console.log(rs)
            //   toast.error({ title: t`Close position failed` })
            // }
            // } catch (e) {
            //   console.log(e)
            //   toast.error({ title: t`Close position failed` })
            // } finally {
            //   setLoading(false)
            // }
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
