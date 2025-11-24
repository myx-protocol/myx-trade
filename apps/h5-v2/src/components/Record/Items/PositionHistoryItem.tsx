import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { FlexRowLayout } from '@/components/FlexRowLayout'

export const PositionHistoryItem = () => {
  return (
    <div className="w-full border-b border-[#202129] px-[16px] pt-[16px] pb-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <p className="text-[14px] font-medium text-white">BTC/USDT</p>
          <div className="mt-[4px] flex gap-[4px]">
            <Tag type="success">
              <Trans>Long</Trans>
            </Tag>
            <Tag type="info" className="px-[6px]">
              <Trans>5x</Trans>
            </Tag>
          </div>
        </div>
        {/* time */}
        <p className="text-[12px] text-[#848E9C]">Order Status</p>
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
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* roe */}
          <div className="text-center">
            <p>
              <Trans>Realized PnL</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText value={12.12} prefix="$" />
            </p>
          </div>
          {/* Margin ratio */}
          <div className="text-right">
            <p>
              <Trans>Total Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })} BTC
            </p>
          </div>
          {/* size */}
          <div>
            <p>
              <Trans>Avg. Close Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* entry price */}
          <div className="text-center">
            <p>
              <Trans>Roe</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText value={12.12} prefix="%" />
            </p>
          </div>
          {/* margin amount */}
          <div className="text-right">
            <p>
              <Trans>Closed Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-[20px] flex flex-col gap-[8px] text-[12px] text-[#848E9C]">
        <FlexRowLayout
          left={<Trans>Open Time</Trans>}
          right={<p className="text-white">2025/11/24 10:00:00</p>}
        />
        <FlexRowLayout
          left={<Trans>Close Time</Trans>}
          right={<p className="text-white">2025/11/24 10:00:00</p>}
        />
      </div>
    </div>
  )
}
