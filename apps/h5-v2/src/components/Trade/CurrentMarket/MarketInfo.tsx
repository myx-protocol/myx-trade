import { formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import Security from '@/components/Icon/set/Security'
import ArrowDown from '@/components/Icon/set/ArrowDown'
import { useTradePageStore } from '../store/TradePageStore'
import { useMarketStore } from '../store/MarketStore'
import { usePoolInfo } from '../hooks/usePoolInfo'
import { useMemo } from 'react'
import { formatUnits } from 'ethers'
import { Tooltips } from '@/components/UI/Tooltips'

export const MarketInfo = () => {
  const { symbolInfo } = useTradePageStore()
  const tickerData = useMarketStore((state) => state.tickerData[symbolInfo?.poolId || ''])
  const { data: poolInfo } = usePoolInfo({
    poolId: symbolInfo?.poolId || '',
    chainId: symbolInfo?.chainId,
  })

  const fundingInfo = useMemo(() => {
    const fundingInfo = poolInfo?.fundingInfo
    if (!fundingInfo) return
    const nextFundingRatePercent = formatUnits(fundingInfo.nextFundingRate, 6)
    return {
      nextFundingRatePercent,
    }
  }, [poolInfo?.fundingInfo])

  return (
    <div className="ml-[40px] flex gap-[40px] text-[12px] leading-[1] font-normal whitespace-nowrap text-[#fff]">
      {/* market price */}
      {/* <div className="flex-shrink-0">
        <p className="text-[#9397A3] whitespace-nowrap">{t`Mark Price`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData., {
            showUnit: false,
          })}
        </p>
      </div> */}

      {/* 24h high */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h High`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.high, {
            showUnit: false,
            decimals: symbolInfo?.quoteDecimals,
          })}
        </p>
      </div>

      {/* 24h low */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h Low`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.low, {
            showUnit: false,
            decimals: symbolInfo?.quoteDecimals,
          })}
        </p>
      </div>

      {/* 24h volume */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h Volume`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.volume, {
            showUnit: false,
            decimals: symbolInfo?.quoteDecimals,
          })}
        </p>
      </div>

      {/* funding */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`Funding`}</p>
        <Tooltips
          title={`${formatNumber(fundingInfo?.nextFundingRatePercent || 0, {
            showUnit: false,
            decimals: 6,
            showSign: true,
          })}%`}
        >
          <p className="mt-[5px] whitespace-nowrap text-[#F29D39]">
            {formatNumber(fundingInfo?.nextFundingRatePercent || 0, {
              showUnit: false,
              decimals: 4,
              showSign: true,
            })}
            %
          </p>
        </Tooltips>
      </div>

      {/* Risk Rating */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`Risk Rating`}</p>
        <p className="mt-[5px] whitespace-nowrap text-[#F29D39]">A</p>
      </div>

      {/* safe  */}
      <div className="flex-shrink-0" role="button">
        <p className="flex items-center whitespace-nowrap text-[#9397A3]">
          <span>{t`Safe`}</span>
          <b className="ml-[4px] inline-flex rotate-[-90deg]">
            <ArrowDown color="#9397A3" size={12} />
          </b>
        </p>
        <p className="mt-[5px] flex items-center whitespace-nowrap text-[#00E3A5]">
          <Security color="#00E3A5" size={10} />
          <span className="ml-[4px]">4/4</span>
        </p>
      </div>
    </div>
  )
}
