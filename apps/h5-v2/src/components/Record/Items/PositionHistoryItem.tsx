import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import {
  CloseTypeEnum,
  DirectionEnum,
  type PositionHistoryItem as PositionHistoryItemType,
} from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { getChainInfo } from '@/config/chainInfo'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { PairLogo } from '@/components/UI/PairLogo'

const OrderCloseType: Partial<Record<CloseTypeEnum, () => string>> = {
  [CloseTypeEnum.PartialClose]: () => t`部分平仓`,
  [CloseTypeEnum.Liquidation]: () => t`强制平仓`,
  [CloseTypeEnum.FullClose]: () => t`全部平仓`,
  [CloseTypeEnum.EarlyClose]: () => t`提前平仓`,
  [CloseTypeEnum.MarketClose]: () => t`市场平仓`,
}

export const PositionHistoryItem = ({ item }: { item: PositionHistoryItemType }) => {
  const symbolInfo = usePoolSymbol({
    chainId: item.chainId,
    poolId: item.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!item.chainId) return null
    return getChainInfo(item.chainId)
  }, [item.chainId])
  return (
    <div className="w-full border-b border-[#202129] px-[16px] pt-[16px] pb-[20px]">
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
                {symbolInfo?.baseSymbol}/{symbolInfo?.quoteSymbol}
              </p>
              <div className="mt-[4px] flex gap-[4px]">
                <Tag type="success">
                  <Trans>{item.direction === DirectionEnum.Long ? t`Long` : t`Short`}</Trans>
                </Tag>
                <Tag type="info" className="px-[6px]">
                  <Trans>{item.userLeverage}x</Trans>
                </Tag>
              </div>
            </div>
          </div>
        </div>
        {/* time */}
        <p className="text-[12px] text-[#848E9C]">{OrderCloseType[item.closeType]?.()}</p>
      </div>
      {/* info */}
      <div className="mt-[16px]">
        <div className="grid grid-cols-3 justify-between gap-[16px] text-[12px] text-[#848E9C]">
          {/* left */}
          {/* unPnl */}
          <div>
            <p>
              <Trans>Avg. Entry Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(item.entryPrice, { showUnit: false })}
            </p>
          </div>
          {/* roe */}
          <div className="text-left">
            <p>
              <Trans>Realized PnL</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText
                value={item.realizedPnl}
                renderOptions={{
                  showUnit: false,
                }}
                prefix="$"
              />
            </p>
          </div>
          {/* Margin ratio */}
          <div className="text-right">
            <p>
              <Trans>Total Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(item.size, { showUnit: false })} {item.baseSymbol}
            </p>
          </div>
          {/* size */}
          <div>
            <p>
              <Trans>Avg. Close Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(item.avgClosePrice, { showUnit: false })}
            </p>
          </div>
          {/* entry price */}
          <div className="text-left">
            <p>
              <Trans>Roe</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText value={item.realizedPnl} prefix="%" />
            </p>
          </div>
          {/* margin amount */}
          <div className="text-right">
            <p>
              <Trans>Closed Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(item.filledSize, { showUnit: false })} {item.baseSymbol}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-[20px] flex flex-col gap-[8px] text-[12px] text-[#848E9C]">
        <FlexRowLayout
          left={<Trans>Open Time</Trans>}
          right={
            <p className="text-white">{dayjs.unix(item.openTime).format('YYYY/MM/DD HH:mm:ss')}</p>
          }
        />
        <FlexRowLayout
          left={<Trans>Close Time</Trans>}
          right={
            <p className="text-white">{dayjs.unix(item.closeTime).format('YYYY/MM/DD HH:mm:ss')}</p>
          }
        />
      </div>
    </div>
  )
}
