import { Box } from '@mui/material'
import { NoticeFill } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { MarketPoolState } from '@myx-trade/sdk'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { cutDownFormat } from '@/utils/timeFormat.ts'
import dayjs from 'dayjs'
import { useCountDown } from 'ahooks'
import { Big } from 'big.js'
import { formatNumber } from '@/utils/number.ts'
import { MYX_DELISTING_RULES_LINK } from '@/config'

export const BenchWarning = () => {
  const { quoteLpDetail, refetch, genesisFeeRate, pool, tvl, markets } = useContext(PoolContext)
  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await Promise.all([refetch])
    }, []),
  })

  const data = useMemo(() => {
    console.log(markets, quoteLpDetail)
    return (markets || []).find((market) => market.marketId === quoteLpDetail?.marketId)
      ?.poolPrimeThreshold
  }, [markets, quoteLpDetail])

  const genesis = useMemo(() => {
    if (data && tvl) {
      console.log(new Big(Number(data)).minus(new Big(tvl?.totalTvl || '0')).toString())
      const _genesis = new Big(Number(data)).minus(new Big(tvl?.totalTvl || '0')).toString()
      return Number(_genesis) < 0 ? 0 : _genesis
    } else {
      return -1
    }
  }, [data, tvl])

  useEffect(() => {
    if (quoteLpDetail?.state === MarketPoolState.PreBench && quoteLpDetail?.poolPreTime) {
      console.log('quoteLpDetail?.poolPreTime:', quoteLpDetail?.poolPreTime)
      // 条件满足才开始倒计时 10 秒
      setTargetDate((quoteLpDetail?.poolPreTime + 24 * 60 * 60) * 1000)
    } else {
      // 条件不满足，停止倒计时
      setTargetDate(undefined)
    }
  }, [quoteLpDetail?.state, quoteLpDetail?.poolPreTime])

  if (!quoteLpDetail) return <></>
  if (quoteLpDetail?.state === MarketPoolState.Trench) return <></>
  if (quoteLpDetail?.state === MarketPoolState.PreBench && !targetDate) return <>1111</>
  if (quoteLpDetail?.state === MarketPoolState.Cook && (!data || !pool || !tvl)) return <></>

  return (
    <Box
      className={
        'bg-warning-10 text-regular flex gap-[6px] rounded-[8px] px-[16px] py-[12px] text-[12px] leading-[1.5] font-[500]'
      }
    >
      <Box className={'mt-[2px]'}>
        <NoticeFill size={14} />
      </Box>

      <p className={''}>
        {pool && quoteLpDetail?.state === MarketPoolState.Cook && Number(genesis) >= 0 && (
          <Trans>
            Only <span className={'text-warning mr-[0.5em]'}>${formatNumber(genesis)}</span>{' '}
            {quoteLpDetail?.mQuoteBaseSymbol || '--'} Genesis Shares left to lock in lifetime
            <span className={'text-warning mx-[0.5em]'}>
              {formatNumberPercent(genesisFeeRate, 0, false)}
            </span>
            trading fees! Or use {pool?.baseSymbol || '--'} to join the{' '}
            <a href={`/cook/${pool?.chainId}/${pool?.poolId}`} className={'text-green'}>
              [{`m${pool?.baseSymbol}.${pool?.quoteSymbol}`}↗]
            </a>{' '}
            pool for the same benefit.
          </Trans>
        )}
        {quoteLpDetail?.state === MarketPoolState.Primed && (
          <Trans>
            The {quoteLpDetail.baseQuoteSymbol} perpetual market is currently preparing to go live.
            Buy {quoteLpDetail.mQuoteBaseSymbol} now to lock in your share and start earning
            immediately once trading opens.
          </Trans>
        )}
        {quoteLpDetail?.state === MarketPoolState.PreBench && (
          <Trans>
            Due to the monthly trading volume not meeting the requirement, the{' '}
            {quoteLpDetail?.mQuoteBaseSymbol} market will be delisted in{' '}
            {cutDownFormat(dayjs.duration(countdown))}. After delisting, buys will be suspended.
            Your ability to sell will not be affected.{' '}
            <a className={'text-green'} href={MYX_DELISTING_RULES_LINK}>
              {' '}
              View Delisting Rules
            </a>
          </Trans>
        )}

        {quoteLpDetail?.state === MarketPoolState.Bench && (
          <Trans>
            Due to [Reason for Delisting], new buys for this market have been paused. You can still
            sell your holdings at any time.
            <a
              href={`/market/${quoteLpDetail.chainId}/${quoteLpDetail?.baseToken}`}
              className={'text-green ml-[0.5em] inline-block'}
            >
              Reactivate Market
            </a>
          </Trans>
        )}

        {/*<Trans> Due to [Reason for Delisting], new  buys for this market have been paused. You can still  sell your holdings at any time.*/}
        {/*     <a href={`/market/${chainId}/${pool.baseToken}`} className={'text-green ml-[0.5em]'}>*/}
        {/*      Reactivate Market*/}
        {/*    </a>*/}
        {/*  </Trans>*/}
      </p>
    </Box>
  )
}
