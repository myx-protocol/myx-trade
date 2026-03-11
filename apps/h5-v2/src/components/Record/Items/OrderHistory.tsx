import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { formatNumber } from '@/utils/number'
import dayjs from 'dayjs'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import {
  DirectionEnum,
  OrderTypeEnum,
  type HistoryOrderItem as HistoryOrderItemType,
} from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { OrderType } from '@/pages/Trade/components/OrderType'
import { useMemo } from 'react'
import { getChainInfo } from '@/config/chainInfo'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { PairLogo } from '@/components/UI/PairLogo'
import { OrderStatus } from '@/pages/Trade/components/OrderStatus'
import { truncateString } from '@/utils/string'
import { Copy } from '@/components/Copy'

export const OrderHistoryItem = ({ item }: { item: HistoryOrderItemType }) => {
  const symbolInfo = usePoolSymbol({
    chainId: item.chainId,
    poolId: item.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!item.chainId) return null
    return getChainInfo(item.chainId)
  }, [item.chainId])
  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <div className="flex items-center gap-[4px]">
            <PairLogo
              baseLogoSize={24}
              quoteLogoSize={10}
              baseLogo={symbolInfo?.baseTokenIcon}
              quoteLogo={chainInfo?.logoUrl}
              quoteClassName=" ml-[-8px]!"
            />
            <div className="flex flex-col items-start gap-[4px]">
              <p className="text-[14px] font-medium text-white">
                {symbolInfo?.baseSymbol}
                {symbolInfo?.quoteSymbol}
              </p>
              <div className="flex gap-[4px]">
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
          </div>
        </div>
        {/* right */}
        <div className="flex shrink-0 flex-col items-end gap-[6px] text-[12px] text-[#848E9C]">
          <p>
            <OrderStatus orderStatus={item.orderStatus} cancelReason={item.cancelReason} />
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
              <span className="text-white">
                {formatNumber(item.lastPrice, { showUnit: false })}
              </span>
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
        <FlexRowLayout
          left={<Trans>Hash</Trans>}
          right={
            <p className="flex items-center gap-[4px] font-medium text-white">
              <span>{truncateString(item.txHash || '', 10, 4)}</span>
              <Copy content={item.txHash || ''} />
            </p>
          }
        />
      </div>
    </div>
  )
}
