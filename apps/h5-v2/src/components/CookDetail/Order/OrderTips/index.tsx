import IconHelp from '@/components/Icon/set/Help'
import { usePoolContext } from '@/pages/Cook/hook'
import { Trans } from '@lingui/react/macro'
import { MarketPoolState } from '@myx-trade/sdk'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { useCountDown } from 'ahooks'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { cutDownFormat } from '@/utils/timeFormat.ts'
import dayjs from 'dayjs'
import { Big } from 'big.js'
import { formatNumber } from '@/utils/number.ts'
import { MYX_CONTACT_SUPPORT, MYX_DELISTING_RULES_LINK } from '@/config/link'
// import { Warning } from '@/components/Icon'
import { PoolSecurityState } from '@/request/lp/type.ts'
import { isCookState } from '@/utils/cook.ts'

export const LPWarning = ({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <div
      className={`bg-warning-10 text-regular flex items-start rounded-[8px] border-[1px] border-[#202129] p-[12px] ${className}`}
    >
      <p className="inline-block text-[12px] leading-[1.5] font-[500]">
        {/*<Warning size={14} className="mr-[4px] inline-block" />*/}
        ⚠️ {children}
      </p>
    </div>
  )
}

export const RiskWarning = ({ className = '' }: { className?: string }) => {
  return (
    <LPWarning className={className}>
      <Trans>Security Warning:</Trans>{' '}
      <Trans>
        This token carries extreme risks. For asset safety, contract trading and liquidity provision
        are not supported.{' '}
        <a href={MYX_CONTACT_SUPPORT} className={'text-green'} target="_blank">
          Contact support
        </a>{' '}
        for assistance.
      </Trans>
    </LPWarning>
  )
}
export const SecurityWarning = ({ className = '' }: { className?: string }) => {
  return (
    <LPWarning className={className}>
      <Trans>Security Notice:</Trans>{' '}
      <Trans>
        The security assessment for this token is incomplete. Providing liquidity or trading may
        carry unknown risks. Proceed with caution at your own risk.
      </Trans>
    </LPWarning>
  )
}
export const OrderTips = () => {
  const { baseLpDetail, refetch, genesisFeeRate, pool, tvl, markets, riskLevelConfig } =
    usePoolContext()
  const [targetDate, setTargetDate] = useState<number>()
  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await Promise.all([refetch])
    }, []),
  })

  const data = useMemo(() => {
    return (markets || []).find((market) => market.marketId === baseLpDetail?.marketId)
      ?.poolPrimeThreshold
  }, [markets, baseLpDetail])

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
  if (riskLevelConfig?.securityState === PoolSecurityState.UNKNOWN) {
    return <SecurityWarning className="mt-[20px]" />
  }
  if (riskLevelConfig?.securityState === PoolSecurityState.NOT_SECURITY) {
    return <RiskWarning className="mt-[20px]" />
  }
  if (baseLpDetail?.state === MarketPoolState.Trench) return <></>
  if (baseLpDetail?.state === MarketPoolState.PreBench && !targetDate) return <></>
  if (isCookState(baseLpDetail?.state) && (!data || !pool || !tvl)) return <></>

  return (
    <div className="bg-warning-10 text-regular mt-[20px] flex items-start gap-[4px] rounded-[8px] border-[1px] border-[#202129] p-[12px]">
      <IconHelp size={14} className="flex-shrink-0 translate-y-[2px]" />
      <p className="text-[12px] leading-[1.5] text-[#CED1D9]">
        {pool && isCookState(baseLpDetail?.state) && Number(genesis) >= 0 && (
          <Trans>
            Only{' '}
            <span className={'text-warning mr-[0.5em]'}>
              $
              {formatNumber(genesis, {
                showUnit: true,
              })}
            </span>{' '}
            {baseLpDetail?.mBaseQuoteSymbol || '--'} Genesis Shares left to lock in lifetime{' '}
            <span className={'text-warning mx-[0.5em]'}>
              {formatNumberPercent(genesisFeeRate, 0, false)}
            </span>
            trading fees! Or use {pool?.quoteSymbol || '--'} to join the{' '}
            <a href={`/earn/${pool?.chainId}/${pool?.poolId}`} className={'text-green'}>
              [{`m${pool?.quoteSymbol}.${pool?.baseSymbol}`}↗]
            </a>{' '}
            pool for the same benefit.
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
            <a className={'text-green'} href={MYX_DELISTING_RULES_LINK} target="_blank">
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
