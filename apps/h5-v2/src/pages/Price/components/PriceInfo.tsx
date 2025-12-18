import { Price } from '@/components/Price'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { decimalToPercent, formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { usePriceStore } from '../store'
import { useUpdateEffect } from 'ahooks'
import { useRef } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useFundingInfo } from '@/components/Trade/hooks/useFundingInfo'
import { t } from '@lingui/core/macro'

export const PriceInfo = () => {
  const { symbolInfo } = usePriceStore()
  const { setTickerData } = useMarketStore()

  const { subscribeToTicker } = useSubscription()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)

  const currentSymbolGlobalIdRef = useRef<number | undefined>(undefined)

  useUpdateEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!symbolInfo || symbolInfo.globalId === currentSymbolGlobalIdRef.current) return
    if (client) {
      currentSymbolGlobalIdRef.current = symbolInfo.globalId
      client.markets
        .getTickerList({
          poolIds: [symbolInfo.poolId],
          chainId: Number(symbolInfo.chainId),
        })
        .then((res) => {
          setTickerData(symbolInfo.poolId, res[0])
          // subscribe oracle price
          // subscribe ticker data
          if (currentSymbolGlobalIdRef.current === symbolInfo.globalId) {
            console.log('subscribe', symbolInfo?.poolId)
            unsubscribe = subscribeToTicker({
              poolId: symbolInfo.poolId,
              globalId: symbolInfo.globalId,
            })
          }
        })
    }
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        console.log('unsubscribe', symbolInfo?.poolId)
        unsubscribe()
      }
    }
  }, [symbolInfo?.poolId, symbolInfo?.globalId, symbolInfo?.chainId, client])

  const tickerData = useMarketStore((state) => state.tickerData[symbolInfo?.poolId || ''])

  const { fundingInfo, countdownLabel, isShowCountdown } = useFundingInfo({
    poolId: symbolInfo?.poolId || '',
    chainId: symbolInfo?.chainId,
  })
  return (
    <div className="mb-[12px] flex items-center justify-between px-[16px]">
      <div>
        <Price className="text-[28px] font-bold" value={tickerData?.price || 0} />
        <p className="text-[12px] leading-[1.5] font-medium text-[#CED1D9]">
          {/* rate value */}
          <span>
            {formatNumber(tickerData?.volume || 0, {
              showUnit: true,
            })}
          </span>
          <RiseFallTextPrecent className="ml-[10px]" value={tickerData?.change || 0} />
        </p>
      </div>

      <div>
        <p className="text-[11px] text-[#6D7180]">
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
        <p className="mt-[6px] text-[13px] font-medium text-[#CED1D9]">
          <span>
            {' '}
            {decimalToPercent(fundingInfo?.nextFundingRatePercent || 0, {
              showSign: false,
            })}
          </span>
          {isShowCountdown && (
            <>
              <span className="px-[2px]">/</span>
              <span>{countdownLabel}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
