import type { ReactNode } from 'react'
import { HoverCard } from '@/components/UI/HoverCard'
import type { TradeFlowItem } from '@myx-trade/sdk'
import { Trans } from '@lingui/react/macro'
import { RiseFallText } from '@/components/RiseFallText'
import Big from 'big.js'

interface TradeFlowDetailProps {
  tradeFlow: TradeFlowItem
  trigger: ReactNode
}

export const TradeFlowDetail = ({ tradeFlow, trigger }: TradeFlowDetailProps) => {
  return (
    <HoverCard trigger={trigger} placement="bottom-start" className="rounded-[16px]! py-[4px]!">
      <div className="flex min-w-[200px] flex-col">
        <div className="flex items-center justify-between border-b-[1px] border-[#202129] px-[16px] py-[12px] text-[12px] leading-[1] font-normal text-[#9397A3]">
          <p>
            <Trans>已实现盈亏</Trans>
          </p>
          <p className="font-medium">
            <RiseFallText
              value={tradeFlow.realizedPnl}
              renderOptions={{
                showUnit: false,
                showSign: true,
              }}
            />
          </p>
        </div>
        <div className="flex items-center justify-between border-b-[1px] border-[#202129] px-[16px] py-[12px] text-[12px] leading-[1] font-normal text-[#9397A3]">
          <p>
            <Trans>保证金</Trans>
          </p>
          <p className="font-medium">
            <RiseFallText
              value={tradeFlow.beforeCollateralAmount}
              renderOptions={{
                showSign: true,
                showUnit: false,
              }}
            />
          </p>
        </div>
        <div className="flex items-center justify-between border-b-[1px] border-[#202129] px-[16px] py-[12px] text-[12px] leading-[1] font-normal text-[#9397A3]">
          <p>
            <Trans>资金费</Trans>
          </p>
          <p className="font-medium">
            <RiseFallText
              value={tradeFlow.fundingFee}
              renderOptions={{
                showSign: true,
                showUnit: false,
              }}
            />
          </p>
        </div>
        <div className="flex items-center justify-between border-b-[1px] border-[#202129] px-[16px] py-[12px] text-[12px] leading-[1] font-normal text-[#9397A3]">
          <p>
            <Trans>执行费</Trans>
          </p>
          <p className="font-medium">
            <RiseFallText
              value={tradeFlow.executionFee}
              renderOptions={{
                showSign: true,
                showUnit: false,
              }}
            />
          </p>
        </div>
        <div className="flex items-center justify-between border-b-[1px] border-[#202129] px-[16px] py-[12px] text-[12px] leading-[1] font-normal text-[#9397A3]">
          <p>
            <Trans>交易手续费</Trans>
          </p>
          <p className="font-medium">
            <RiseFallText
              value={tradeFlow.tradingFee}
              renderOptions={{
                showSign: true,
                showUnit: false,
              }}
            />
          </p>
        </div>
      </div>
    </HoverCard>
  )
}
