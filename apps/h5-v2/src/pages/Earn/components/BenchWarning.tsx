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
import { MYX_DELISTING_RULES_LINK } from '@/config/link'
import { BoostType, PoolBaseState, PoolSecurityState } from '@/request/lp/type.ts'
import { Info, RiskWarning, SecurityWarning } from '@/components/CookDetail/Order/OrderTips'
import { isCookState } from '@/utils/cook.ts'
import { useOnBoostPool } from '@/hooks/lp/useOnBoostPool.ts'
import { useOnUnBoostPool } from '@/hooks/lp/useOnUnBoostPool.ts'
import { useClaimRefund } from '@/hooks/lp/useClaimRefund.ts'
import { ConfirmEnableTradingDialog } from '@/components/Dialog/ConfirmEnableTradingDialog.tsx'
import { MarketLaunchStatusDialog } from '@/components/Dialog/MarketLaunchStatusDialog.tsx'
import { MarketActivationFailedDialog } from '@/components/Dialog/MarketActivationFailedDialog.tsx'
import { isAddressEqual } from 'viem'
import type { Address } from '@/request/type.ts'
import { useAccount } from 'wagmi'

export const BenchStateWarning = () => {
  const {
    quoteLpDetail,
    refetch,
    genesisFeeRate,
    pool,
    tvl,
    markets,
    riskLevelConfig,
    boostedPrimeTvl,
    boostInfo,
  } = useContext(PoolContext)

  const { address } = useAccount()

  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await Promise.all([refetch])
    }, []),
  })

  const market = useMemo(() => {
    return (markets || []).find((market) => market.marketId === quoteLpDetail?.marketId)
  }, [markets, quoteLpDetail])

  const genesis = useMemo(() => {
    if (market?.poolPrimeThreshold && tvl) {
      console.log(
        new Big(Number(market?.poolPrimeThreshold)).minus(new Big(tvl?.totalTvl || '0')).toString(),
      )
      const _genesis = new Big(Number(market?.poolPrimeThreshold))
        .minus(new Big(tvl?.totalTvl || '0'))
        .toString()
      return Number(_genesis) < 0 ? 0 : _genesis
    } else {
      return -1
    }
  }, [market?.poolPrimeThreshold, tvl])

  const deductedAmount = useMemo(() => {
    return (
      (market?.boostFeeUsd &&
        market?.boostRefundFeeUsd &&
        Big(market?.boostFeeUsd)?.minus(market?.boostRefundFeeUsd)?.toString()) ||
      '0'
    )
  }, [market?.boostFeeUsd, market?.boostRefundFeeUsd])

  const { boostConfirmBoostOpen, setBoostConfirmBoostOpen, onBoostPool } = useOnBoostPool()

  const { unBoostConfirmBoostOpen, setUnBoostConfirmBoostOpen, onUnBoostPool } = useOnUnBoostPool()

  const { claimRefundOpen, setClaimRefundOpen, onClaimRefund } = useClaimRefund()

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

  if (riskLevelConfig?.securityState === PoolSecurityState.UNKNOWN) {
    return <SecurityWarning />
  }
  if (riskLevelConfig?.securityState === PoolSecurityState.NOT_SECURITY) {
    return <RiskWarning />
  }

  if (quoteLpDetail?.state === MarketPoolState.Trench) return <></>
  if (quoteLpDetail?.state === MarketPoolState.PreBench && !targetDate) return <></>
  if (isCookState(quoteLpDetail?.state) && (!market?.poolPrimeThreshold || !pool || !tvl))
    return <></>

  return (
    <>
      {pool &&
        isCookState(quoteLpDetail?.state) &&
        riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
        Number(genesis) >= 0 &&
        boostInfo?.type !== BoostType.Requested && (
          <Info>
            <Trans>
              Only{' '}
              <span className={'text-warning mr-[0.5em]'}>
                $
                {formatNumber(genesis, {
                  showUnit: true,
                })}
              </span>{' '}
              {quoteLpDetail?.mQuoteBaseSymbol || '--'} Genesis Shares left to activate the
              market!Join now to lock in a LIFETIME
              <span className={'text-warning mx-[0.5em]'}>
                {formatNumberPercent(genesisFeeRate, 0, false)}
              </span>
              fee share! You can also pay {formatNumber(market?.boostFeeUsd, { showUnit: false })}{' '}
              {pool?.quoteSymbol || '--'} to activate instantly! 👉{' '}
              <button
                className={'text-green cursor-pointer'}
                onClick={() => setBoostConfirmBoostOpen(true)}
              >
                [ Unlock Market Early ↗ ]
              </button>
            </Trans>
          </Info>
        )}

      {pool &&
        isCookState(quoteLpDetail?.state) &&
        boostedPrimeTvl &&
        riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
        Number(genesis) >= 0 &&
        boostInfo?.type === BoostType.Requested &&
        address &&
        boostInfo?.proposer &&
        isAddressEqual(boostInfo?.proposer as Address, address) &&
        (new Big(tvl?.totalTvl || '0').gte(boostedPrimeTvl || '0') ? (
          <Info>
            <Trans>
              Market launch fee paid and TVL threshold met! Waiting for smart contract execution to
              force start trading.{' '}
              <button
                className={'text-green cursor-pointer'}
                onClick={() => setUnBoostConfirmBoostOpen(true)}
              >
                [ View Status → ]
              </button>
            </Trans>
          </Info>
        ) : (
          <Info>
            <Trans>
              Market launch fee paid! Only{' '}
              <span className="text-warning">
                $
                {formatNumber(
                  Big(boostedPrimeTvl)
                    .minus(tvl?.totalTvl || '0')
                    .toString(),
                  { showUnit: false },
                )}{' '}
                more TVL
              </span>{' '}
              needed to force start trading. Join now to lock in a LIFETIME{' '}
              {formatNumberPercent(genesisFeeRate, 0, false)} fee share!{' '}
              <button
                className={'text-green cursor-pointer'}
                onClick={() => setUnBoostConfirmBoostOpen(true)}
              >
                [ View Status → ]
              </button>
            </Trans>
          </Info>
        ))}

      {pool &&
        isCookState(quoteLpDetail?.state) &&
        riskLevelConfig?.baseState === PoolBaseState.PRIME_FAIL &&
        boostInfo?.type === BoostType.Requested &&
        address &&
        boostInfo?.proposer &&
        isAddressEqual(boostInfo?.proposer as Address, address) && (
          <Info>
            <Trans>
              Market Opening Failed! You have{' '}
              {formatNumber(market?.boostRefundFeeUsd, { showUnit: false })} {pool?.quoteSymbol}{' '}
              funds pending.👉{' '}
              <button
                className={'text-green cursor-pointer'}
                onClick={() => setClaimRefundOpen(true)}
              >
                [ Claim Refund Now ↗ ]
              </button>
            </Trans>
          </Info>
        )}

      {quoteLpDetail?.state === MarketPoolState.Primed && (
        <Info>
          <Trans>
            The {quoteLpDetail.baseQuoteSymbol} perpetual market is currently preparing to go live.
            Buy {quoteLpDetail.mQuoteBaseSymbol} now to lock in your share and start earning
            immediately once trading opens.
          </Trans>
        </Info>
      )}

      {quoteLpDetail?.state === MarketPoolState.PreBench && (
        <Info>
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
        </Info>
      )}
      {quoteLpDetail?.state === MarketPoolState.Bench && (
        <Info>
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
        </Info>
      )}

      <ConfirmEnableTradingDialog
        open={boostConfirmBoostOpen}
        tokenSymbol={pool?.quoteSymbol}
        feeAmount={market?.boostFeeUsd}
        refundAmount={market?.boostRefundFeeUsd}
        deductedAmount={deductedAmount}
        tvlThreshold={boostedPrimeTvl}
        onClose={() => setBoostConfirmBoostOpen(false)}
        onNotNow={() => setBoostConfirmBoostOpen(false)}
        onPay={async () => {
          await onBoostPool()
        }}
      />
      <MarketLaunchStatusDialog
        open={unBoostConfirmBoostOpen}
        tokenSymbol={pool?.quoteSymbol}
        minTVL={boostedPrimeTvl}
        feeAmount={market?.boostFeeUsd}
        refundAmount={market?.boostRefundFeeUsd}
        penaltyAmount={deductedAmount}
        onClose={() => setUnBoostConfirmBoostOpen(false)}
        onAbort={async () => {
          await onUnBoostPool()
        }}
        onWait={() => setUnBoostConfirmBoostOpen(false)}
      />
      <MarketActivationFailedDialog
        open={claimRefundOpen}
        tokenSymbol={pool?.quoteSymbol}
        deductedAmount={deductedAmount}
        refundAmount={market?.boostRefundFeeUsd}
        onClose={() => setClaimRefundOpen(false)}
        onLater={() => setClaimRefundOpen(false)}
        onClaimRefund={() => onClaimRefund(quoteLpDetail?.state)}
      />
    </>
  )
}

export const BenchWarning = () => {
  const { pool } = useContext(PoolContext)
  return (
    <>
      <BenchStateWarning />
      {pool && (
        <Info>
          <Trans>
            Only holding {pool?.baseSymbol || '--'}?{' '}
            <a href={`/cook/${pool?.chainId}/${pool?.poolId}`} className={'text-green'}>
              [{`m${pool?.baseSymbol}.${pool?.quoteSymbol}`}↗]
            </a>{' '}
          </Trans>
        </Info>
      )}
    </>
  )
}
