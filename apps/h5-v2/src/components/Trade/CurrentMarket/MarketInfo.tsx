import { decimalToPercent, formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import Security from '@/components/Icon/set/Security'
import ArrowDown from '@/components/Icon/set/ArrowDown'
import { useTradePageStore } from '../store/TradePageStore'
import { useMarketStore } from '../store/MarketStore'

import { Tooltips } from '@/components/UI/Tooltips'
import { useSecurityInfo } from '@/api'
import { SafeList } from '@/components/SafeList'
import { Popover } from '@/components/UI/Popover'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useFundingInfo } from '../hooks/useFundingInfo'
import { Trans } from '@lingui/react/macro'

export const MarketInfo = () => {
  const { symbolInfo } = useTradePageStore()
  const { poolConfig } = useGetPoolConfig(symbolInfo?.poolId, symbolInfo?.chainId)
  const tickerData = useMarketStore((state) => state.tickerData[symbolInfo?.poolId || ''])

  const { fundingInfo, countdownLabel, isShowCountdown } = useFundingInfo({
    poolId: symbolInfo?.poolId || '',
    chainId: symbolInfo?.chainId,
  })

  const { data: securityInfo } = useSecurityInfo({
    address: symbolInfo?.baseToken || '',
    chainId: symbolInfo?.chainId as number,
  })

  return (
    <div className="ml-[40px] flex gap-[40px] text-[12px] leading-[1] font-normal whitespace-nowrap text-[#fff]">
      {/* 24h high */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h High`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.high || 0, {
            showUnit: false,
          })}
        </p>
      </div>

      {/* 24h low */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h Low`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.low || 0, {
            showUnit: false,
          })}
        </p>
      </div>

      {/* 24h volume */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`24h Volume`}</p>
        <p className="mt-[5px] whitespace-nowrap">
          {formatNumber(tickerData?.volume || 0, {
            showUnit: false,
          })}
        </p>
      </div>

      {/* funding */}
      <div className="flex-shrink-0">
        <Tooltips
          title={t`结算时，多空之间需要支付的资金费，当费率为正时，多头向空头付费；当费率为负时，空头向多头付费。`}
        >
          <p className="text-tooltip whitespace-nowrap text-[#9397A3]">
            {isShowCountdown ? (
              <>
                <Trans>Funding rate</Trans>
                <span className="px-[2px]">/</span>
                <Trans>Countdown</Trans>{' '}
              </>
            ) : (
              t`Funding rate`
            )}
          </p>
        </Tooltips>
        <Tooltips
          title={decimalToPercent(fundingInfo?.nextFundingRatePercent || 0, {
            showSign: false,
            decimals: 18,
            removeTrailingZeros: true,
          })}
        >
          <div className="mt-[5px] flex items-center whitespace-nowrap">
            <p className="text-[#F29D39]">
              {decimalToPercent(fundingInfo?.nextFundingRatePercent || 0, {
                showSign: false,
              })}
            </p>
            {isShowCountdown && (
              <>
                <span className="px-[2px] text-white">/</span>
                <p className="text-white">{countdownLabel}</p>
              </>
            )}
          </div>
        </Tooltips>
      </div>

      {/* Risk Rating */}
      <div className="flex-shrink-0">
        <p className="whitespace-nowrap text-[#9397A3]">{t`Risk Rating`}</p>
        <p className="mt-[5px] whitespace-nowrap text-[#F29D39]">{poolConfig?.levelName}</p>
      </div>

      {/* safe  */}
      {securityInfo?.count && securityInfo?.count > 0 && (
        <Popover
          trigger={
            <div className="flex-shrink-0" role="button">
              <p className="flex items-center whitespace-nowrap text-[#9397A3]">
                <span>{t`Safe`}</span>
                <b className="ml-[4px] inline-flex rotate-[-90deg]">
                  <ArrowDown color="#9397A3" size={12} />
                </b>
              </p>
              <p className="mt-[5px] flex items-center whitespace-nowrap text-[#00E3A5]">
                <Security color="#00E3A5" className="flex-shrink-0" size={13} />
                <span className="ml-[4px]">
                  {securityInfo?.security_count}/{securityInfo?.count}
                </span>
              </p>
            </div>
          }
        >
          <SafeList chainId={symbolInfo?.chainId as number} address={symbolInfo?.baseToken || ''} />
        </Popover>
      )}
    </div>
  )
}
