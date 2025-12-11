import { Tag } from '@/components/Tag/index'
import { OrderTpSlButton } from '@/components/Trade/Dialog/OrderTpSl'
import { InfoButton } from '@/components/UI/Button'
import { CancelOrderButton } from '@/pages/Trade/components/CancelOrderButton'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { DirectionEnum, OrderTypeEnum } from '@myx-trade/sdk'
import dayjs from 'dayjs'

export const OpenOrderItem = ({ order, pool }: { order: any; pool: any }) => {
  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <p className="text-[16px] font-semibold text-white">
            {order.baseSymbol}/{order.quoteSymbol}
          </p>
          <div className="mt-[4px] flex gap-[4px]">
            <Tag type={order.direction === DirectionEnum.Long ? 'success' : 'danger'}>
              {order.direction === DirectionEnum.Long ? <Trans>Long</Trans> : <Trans>Short</Trans>}
            </Tag>
            <Tag type="info">
              {order.orderType === OrderTypeEnum.Limit ? (
                <Trans>Limit</Trans>
              ) : order.orderType === OrderTypeEnum.Market ? (
                <Trans>Market</Trans>
              ) : (
                <Trans>TPSL</Trans>
              )}
            </Tag>
            <Tag type="info">
              <Trans>Isolated {order.userLeverage}x</Trans>
            </Tag>
          </div>
        </div>
        {/* time */}
        <p className="text-[12px] text-[#848E9C]">
          {dayjs.unix(order.txTime).format('YYYY/MM/DD HH:mm:ss')}
        </p>
      </div>
      {/* info */}
      <div className="mt-[20px]">
        <div className="grid grid-cols-3 justify-between gap-[16px] text-[12px] text-[#848E9C]">
          {/* left */}
          {/* margin */}
          <div>
            <p>
              <Trans>Margin({order.quoteSymbol})</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(order.collateralAmount, { showUnit: false })}
            </p>
          </div>
          {/* amount */}
          <div>
            <p>
              <Trans>Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(order.size, { showUnit: false })}
            </p>
          </div>
          {/* price */}
          <div className="text-center">
            <p>
              <Trans>Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(order.price, { showUnit: false })}
            </p>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-[20px] flex justify-center gap-[8px]">
        <OrderTpSlButton order={order} poolInfo={pool} />
        <CancelOrderButton orderId={order.orderId} chainId={order.chainId} />
      </div>
    </div>
  )
}
