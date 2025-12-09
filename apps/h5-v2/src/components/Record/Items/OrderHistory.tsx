import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { Share } from '@/components/Icon'
import { InfoButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import dayjs from 'dayjs'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import {
  DirectionEnum,
  OrderTypeEnum,
  type HistoryOrderItem as HistoryOrderItemType,
} from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { OrderType } from '@/pages/Trade/components/OrderType'

export const OrderHistoryItem = ({ item }: { item: HistoryOrderItemType }) => {
  const symbol =
    !item.baseSymbol || !item.quoteSymbol ? '--' : `${item.baseSymbol}/${item.quoteSymbol}`
  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <p className="text-[14px] font-medium text-white">{symbol}</p>
          <div className="mt-[4px] flex gap-[4px]">
            <Tag type={item.direction === DirectionEnum.Long ? 'success' : 'danger'}>
              <Trans>{item.direction === DirectionEnum.Long ? t`Long` : t`Short`}</Trans>
            </Tag>
            <Tag type="info">
              <Trans>{item.orderType === OrderTypeEnum.Limit ? t`Limit` : t`Market`}</Trans>
            </Tag>
            <Tag type="info">
              <Trans>Isolated {item.userLeverage}x</Trans>
            </Tag>
          </div>
        </div>
        {/* right */}
        <div className="flex shrink-0 flex-col items-end gap-[6px] text-[12px] text-[#848E9C]">
          <p>
            <OrderType orderType={item.orderType} operation={item.operation} />
          </p>
          <p>{dayjs.unix(item.txTime).format('YYYY/MM/DD HH:mm:ss')}</p>
        </div>
      </div>
      {/* info */}
      <div className="mt-[16px] flex flex-col gap-[8px] text-[12px] text-[#848E9C]">
        <FlexRowLayout
          left={<Trans>Amount({item.baseSymbol})</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">{formatNumber(item.size, { showUnit: false })}</span>
              <span className="px-[2px]">/</span>
              <span>{formatNumber(item.size, { showUnit: false })}</span>
            </div>
          }
        />
        <FlexRowLayout
          left={<Trans>Price/Price</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">{formatNumber(item.price, { showUnit: false })}</span>
              <span className="px-[2px]">/</span>
              <span>{formatNumber(item.price, { showUnit: false })}</span>
            </div>
          }
        />
        <FlexRowLayout
          left={<Trans>Fee({item.executionFeeToken?.toString() || '--'})</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">
                {formatNumber(item.executionFeeAmount, {
                  showUnit: false,
                })}
              </span>
            </div>
          }
        />
      </div>
    </div>
  )
}
