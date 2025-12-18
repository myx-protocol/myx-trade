import IconHelp from '@/components/Icon/set/Help'
import { usePoolContext } from '@/pages/Cook/hook'
import { Trans } from '@lingui/react/macro'
import { MarketPoolState, market } from '@myx-trade/sdk'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useCountDown } from 'ahooks'
import { useCallback, useEffect, useState } from 'react'
import { cutDownFormat } from '@/utils/timeFormat.ts'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { Big } from 'big.js'

export const OrderTips = () => {
  const { baseLpDetail, refetch, genesisFeeRate, tvl } = usePoolContext()
  const [targetDate, setTargetDate] = useState<number>()
  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await Promise.all([refetch])
    }, []),
  })

  const { data } = useQuery({
    queryKey: [
      { key: 'getMarket' },
      baseLpDetail?.marketId,
      baseLpDetail?.chainId,
      baseLpDetail?.state,
      tvl,
    ],
    enabled:
      !!baseLpDetail?.marketId &&
      !!baseLpDetail?.chainId &&
      baseLpDetail?.state === MarketPoolState.Cook,
    queryFn: async () => {
      if (!baseLpDetail?.marketId || !baseLpDetail?.chainId) return ''
      try {
        const result = await market.getMarket(Number(baseLpDetail?.chainId), baseLpDetail?.marketId)
        console.log(result?.poolPrimeThreshold)
        console.log(
          new Big(Number(result?.poolPrimeThreshold)).minus(new Big(tvl || '0')).toString(),
        )
        if (result?.poolPrimeThreshold) {
          return new Big(Number(result?.poolPrimeThreshold)).minus(new Big(tvl || '0')).toString()
        }
        return ''
      } catch (error) {
        return ''
      }
    },
  })

  useEffect(() => {
    if (baseLpDetail?.state === MarketPoolState.PreBench) {
      console.log('baseLpDetail?.poolPreTime:', baseLpDetail?.poolPreTime)
      // 条件满足才开始倒计时 10 秒
      setTargetDate((baseLpDetail?.poolPreTime + 24 * 60 * 60) * 1000)
    } else {
      // 条件不满足，停止倒计时
      setTargetDate(undefined)
    }
  }, [baseLpDetail?.state, baseLpDetail?.poolPreTime])

  if (!baseLpDetail) return <></>
  if (baseLpDetail?.state === MarketPoolState.Trench) return <></>
  if (baseLpDetail?.state === MarketPoolState.PreBench && !targetDate) return <></>
  if (baseLpDetail?.state === MarketPoolState.Cook && !data) return <></>

  return (
    <div className="bg-warning-10 text-regular mt-[20px] flex items-start gap-[4px] rounded-[8px] border-[1px] border-[#202129] p-[12px]">
      <IconHelp size={14} className="flex-shrink-0 translate-y-[2px]" />
      <p className="text-[12px] leading-[1.5] text-[#CED1D9]">
        {baseLpDetail?.state === MarketPoolState.Cook && (
          <Trans>
            Act fast! Just{' '}
            <span className={'text-warning mr-[0.5em]'}>
              ${formatNumberPrecision(data, COMMON_PRICE_DISPLAY_DECIMALS)}
            </span>
            {baseLpDetail?.mBaseQuoteSymbol || '--'} Genesis Shares are left. Secure your lifetime
            <span className={'text-warning ml-[0.5em]'}>
              {formatNumberPercent(genesisFeeRate, 0, false)}
            </span>{' '}
            share of all trading fees!
          </Trans>
        )}

        {baseLpDetail?.state === MarketPoolState.Primed && (
          <Trans>
            The {baseLpDetail.symbolName} perpetual market is currently preparing to go live. Buy{' '}
            {baseLpDetail.mBaseQuoteSymbol} now to lock in your share and start earning immediately
            once trading opens.
          </Trans>
        )}

        {baseLpDetail?.state === MarketPoolState.PreBench && (
          <Trans>
            Due to the monthly trading volume not meeting the requirement, the{' '}
            {baseLpDetail?.mBaseQuoteSymbol} market will be delisted in{' '}
            {cutDownFormat(dayjs.duration(countdown))}. After delisting, buys will be suspended.
            Your ability to sell will not be affected.{' '}
            <a className={'text-green'} href={''}>
              {' '}
              View Delisting Rules
            </a>
          </Trans>
        )}

        {baseLpDetail?.state === MarketPoolState.Bench && (
          <Trans>
            Due to [Reason for Delisting], new buys for this market have been paused. You can still
            sell your holdings at any time.
            <a
              href={`/market/${baseLpDetail.chainId}/${baseLpDetail.baseToken}`}
              className={'text-green ml-[0.5em] inline-block'}
            >
              Reactivate Market
            </a>
          </Trans>
        )}
      </p>
    </div>
  )
}
