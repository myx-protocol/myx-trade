import { DialogBase } from '@/components/UI/DialogBase'
import { OrderTpSlButton } from '@/components/Trade/Dialog/OrderTpSl'
import { TpSlButton } from '@/components/Trade/Dialog/TPSL'
import { CancelOrderButton } from '@/pages/Trade/components/CancelOrderButton'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { displayAmount, formatNumber } from '@/utils/number'
import { parseBigNumber } from '@/utils/bn'
import { InfoButton } from '@/components/UI/Button'
import { EditIcon } from '@/components/UI/Icon'
import { Direction, OrderTypeEnum, TriggerType } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import dayjs from 'dayjs'
import { useState } from 'react'
import { RenderLiqPrice } from '@/components/Trade/Dialog/TPSL'

const renderTriggerPrice = (order: any): string => {
  const symbol = order.triggerType === TriggerType.GTE ? '≥' : '≤'
  return `${symbol} ${displayAmount(order.price)}`
}

const renderTpSlType = (order: any): string => {
  if (order.orderType === OrderTypeEnum.Stop) {
    if (order.triggerType === TriggerType.GTE && order.direction === Direction.LONG) {
      return 'TP'
    }

    if (order.triggerType === TriggerType.LTE && order.direction === Direction.LONG) {
      return 'SL'
    }

    if (order.triggerType === TriggerType.GTE && order.direction === Direction.SHORT) {
      return 'SL'
    }

    if (order.triggerType === TriggerType.LTE && order.direction === Direction.SHORT) {
      return 'TP'
    }
  }

  return '--'
}

export const PositionTpSlButton = ({
  position,
  orders,
  pool,
}: {
  position: any
  orders: any[]
  pool: any
}) => {
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[position?.poolId]?.price ?? 0
  const [open, setOpen] = useState(false)

  return (
    <>
      <InfoButton
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 500,
        }}
      >
        <Trans>TP/SL</Trans>
      </InfoButton>

      <DialogBase title={t`TP/SL`} open={open} onClose={() => setOpen(false)}>
        <div
          className={`flex items-center gap-[4px] text-[16px] leading-[16px] ${position.direction === Direction.LONG ? 'text-[#00E3A5]' : 'text-[#EC605A]'}`}
        >
          <p>
            {position?.baseSymbol}/{position?.quoteSymbol}
          </p>
          <p>{position.userLeverage}x</p>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Current Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            {formatNumber(marketPrice, { showUnit: false })}
          </p>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Entry Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            {formatNumber(position.entryPrice, { showUnit: false })}
          </p>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Auto TP Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            {parseBigNumber(position.earlyClosePrice ?? '0').gt(0)
              ? formatNumber(position.earlyClosePrice, { showUnit: false })
              : '--'}
          </p>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Liq.Price</Trans>
          </p>
          <RenderLiqPrice position={position} marketPrice={marketPrice.toString()} />
        </div>

        <div className="mt-[12px] max-h-[300px] overflow-y-auto pb-[5px]">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="mt-[8px] rounded-[10px] border border-[#333842] p-[16px]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-[white]">{renderTpSlType(order)}</p>
                <p className="text-[12px] font-[500] text-[#848E9C]">
                  {dayjs(order.txTime * 1000).format('YYYY/MM/DD HH:mm:ss')}
                </p>
              </div>

              <div className="mt-[16px] flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-[#848E9C]">
                    <Trans>Trigger Price</Trans>
                  </p>
                  <p className="mt-[4px] text-[12px] text-[#CED1D9]">{renderTriggerPrice(order)}</p>
                </div>

                <div className="flex flex-col items-start">
                  <p className="text-[12px] text-[#848E9C]">
                    <Trans>执行价格</Trans>
                  </p>
                  <p className="mt-[4px] text-[12px] text-[#CED1D9]">
                    <Trans>市价</Trans>
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-[12px] text-[#848E9C]">
                    <Trans>Size</Trans>
                    {position?.baseSymbol}
                  </p>
                  <p className="mt-[4px] text-[12px] text-[#CED1D9]">{displayAmount(order.size)}</p>
                </div>
              </div>

              <div className="mt-[16px] flex items-center justify-between gap-[8px]">
                <OrderTpSlButton
                  btnText={t`Edit`}
                  isSingle={true}
                  className="flex-1"
                  isEdit={true}
                  order={{ ...order, positionEntryPrice: position.entryPrice }}
                  poolInfo={pool}
                />
                <CancelOrderButton
                  orderId={order.orderId}
                  chainId={position?.chainId}
                  className="flex-1"
                  poolId={order.poolId}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[16px] flex items-center justify-between gap-[8px]">
          <InfoButton
            className="h-[44px] flex-1"
            style={{ borderRadius: '44px' }}
            onClick={() => setOpen(false)}
          >
            <Trans>Cancel</Trans>
          </InfoButton>
          <TpSlButton
            isPrimary
            position={position}
            poolInfo={pool}
            isAdd={true}
            addText={t`继续添加`}
            className="h-[44px] flex-1"
            style={{ borderRadius: '44px' }}
          />
        </div>
      </DialogBase>
    </>
  )
}
