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
import { BoostType, PoolBaseState, PoolSecurityState } from '@/request/lp/type.ts'
import { ConfirmEnableTradingDialog } from '@/components/Dialog/ConfirmEnableTradingDialog.tsx'
import { useOnBoostPool } from '@/hooks/lp/useOnBoostPool.ts'
import { isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'
import type { Address } from '@/request/type.ts'
import { MarketLaunchStatusDialog } from '@/components/Dialog/MarketLaunchStatusDialog'
import { useOnUnBoostPool } from '@/hooks/lp/useOnUnBoostPool.ts'
import { useClaimRefund } from '@/hooks/lp/useClaimRefund.ts'
import { MarketActivationFailedDialog } from '@/components/Dialog/MarketActivationFailedDialog.tsx'
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

export const Info = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={`bg-warning-10 text-regular flex items-start gap-[4px] rounded-[8px] border-[1px] border-[#202129] p-[12px] ${className}`}
    >
      <IconHelp size={14} className="flex-shrink-0 translate-y-[2px]" />
      <p className="text-[12px] leading-[1.5]">{children}</p>
    </div>
  )
}
export const OrderTip = () => {
  const {
    baseLpDetail,
    refetch,
    genesisFeeRate,
    pool,
    tvl,
    markets,
    riskLevelConfig,
    boostedPrimeTvl,
    boostInfo,
    refetchBoostInfo,
  } = usePoolContext()
  const { address } = useAccount()

  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await Promise.all([refetch])
    }, []),
  })

  const market = useMemo(() => {
    return (markets || []).find((market) => market.marketId === baseLpDetail?.marketId)
  }, [markets, baseLpDetail])

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

  const [isOnBoostSuccess, setIsOnBoostSuccess] = useState(false)

  const { boostConfirmBoostOpen, setBoostConfirmBoostOpen, onBoostPool } = useOnBoostPool({
    onSuccess: () => setIsOnBoostSuccess(true),
  })
  const { unBoostConfirmBoostOpen, setUnBoostConfirmBoostOpen, onUnBoostPool } = useOnUnBoostPool()

  const { claimRefundOpen, setClaimRefundOpen, onClaimRefund } = useClaimRefund()

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
    return <SecurityWarning className="mt-[12px]" />
  }
  if (riskLevelConfig?.securityState === PoolSecurityState.NOT_SECURITY) {
    return <RiskWarning className="mt-[12px]" />
  }
  if (baseLpDetail?.state === MarketPoolState.Trench) return <></>
  if (baseLpDetail?.state === MarketPoolState.PreBench && !targetDate) return <></>
  if (isCookState(baseLpDetail?.state) && (!market?.poolPrimeThreshold || !pool || !tvl))
    return <></>

  return (
    <>
      {pool &&
        isCookState(baseLpDetail?.state) &&
        riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
        Number(genesis) >= 0 &&
        boostInfo?.type !== BoostType.Requested && (
          <Info className="mt-[12px]">
            <Trans>
              Only{' '}
              <span className={'text-warning mr-[0.5em]'}>
                $
                {formatNumber(genesis, {
                  showUnit: true,
                })}
              </span>{' '}
              {baseLpDetail?.mBaseQuoteSymbol || '--'} Genesis Shares left to activate the
              market!Join now to lock in a LIFETIME{' '}
              <span className={'text-warning mx-[0.5em]'}>
                {formatNumberPercent(genesisFeeRate, 0, false)}
              </span>
              fee share! You can also pay {formatNumber(market?.boostFeeUsd, { showUnit: false })}{' '}
              {pool?.quoteSymbol || '--'} to activate instantly! 👉{' '}
              {!isOnBoostSuccess ? (
                <>
                  <button
                    className={'text-green cursor-pointer'}
                    onClick={() => {
                      setBoostConfirmBoostOpen(true)
                    }}
                  >
                    [ {<Trans>Unlock Market Early</Trans>} ↗ ]
                  </button>
                </>
              ) : (
                <button disabled className={'text-green cursor-not-allowed opacity-50'}>
                  [ {<Trans>`Paid. Syncing status</Trans>}... ]
                </button>
              )}
            </Trans>
          </Info>
        )}

      {pool &&
        isCookState(baseLpDetail?.state) &&
        boostedPrimeTvl &&
        riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
        Number(genesis) >= 0 &&
        boostInfo?.type === BoostType.Requested &&
        (new Big(tvl?.totalTvl || '0').gte(boostedPrimeTvl || '0') ? (
          <Info className="mt-[12px]">
            <Trans>
              Market launch fee paid and TVL threshold met! Waiting for smart contract execution to
              force start trading.{' '}
              {address &&
                boostInfo?.proposer &&
                isAddressEqual(boostInfo?.proposer as Address, address) && (
                  <button
                    className={'text-green cursor-pointer'}
                    onClick={() => {
                      setUnBoostConfirmBoostOpen(true)
                      setIsOnBoostSuccess(false)
                    }}
                  >
                    [ <Trans>View Status</Trans> → ]
                  </button>
                )}
            </Trans>
          </Info>
        ) : (
          <Info className="mt-[12px]">
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
              {address &&
                boostInfo?.proposer &&
                isAddressEqual(boostInfo?.proposer as Address, address) && (
                  <button
                    className={'text-green cursor-pointer'}
                    onClick={() => {
                      setUnBoostConfirmBoostOpen(true)
                      setIsOnBoostSuccess(false)
                    }}
                  >
                    [ <Trans>View Status</Trans> → ]
                  </button>
                )}
            </Trans>
          </Info>
        ))}

      {pool &&
        isCookState(baseLpDetail?.state) &&
        riskLevelConfig?.baseState === PoolBaseState.PRIME_FAIL &&
        boostInfo?.type === BoostType.Requested && (
          <Info className="mt-[12px]">
            <Trans>
              Market Opening Failed! You have{' '}
              {formatNumber(market?.boostRefundFeeUsd, { showUnit: false })} {pool?.quoteSymbol}{' '}
              funds pending.👉{' '}
              {address &&
                boostInfo?.proposer &&
                isAddressEqual(boostInfo?.proposer as Address, address) && (
                  <button
                    className={'text-green cursor-pointer'}
                    onClick={() => {
                      setClaimRefundOpen(true)
                      setIsOnBoostSuccess(false)
                    }}
                  >
                    [ <Trans>Claim Refund Now</Trans> ↗ ]
                  </button>
                )}
            </Trans>
          </Info>
        )}

      {baseLpDetail?.state === MarketPoolState.Primed && (
        <Info className="mt-[12px]">
          <Trans>
            The {baseLpDetail.symbolName} perpetual market is currently preparing to go live. Buy{' '}
            {baseLpDetail.mBaseQuoteSymbol} now to lock in your share and start earning immediately
            once trading opens.
          </Trans>
        </Info>
      )}

      {baseLpDetail?.state === MarketPoolState.PreBench && (
        <Info className="mt-[12px]">
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
        </Info>
      )}

      {baseLpDetail?.state === MarketPoolState.Bench && (
        <Info className="mt-[12px]">
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
        penaltyAmount={deductedAmount}
        refundAmount={market?.boostRefundFeeUsd}
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
        onClaimRefund={() => onClaimRefund(baseLpDetail?.state)}
      />
    </>
  )
}

export const OrderTips = () => {
  const { pool } = usePoolContext()
  return (
    <>
      <OrderTip />
      {pool && (
        <Info className="mt-[12px]">
          <Trans>
            Only holding {pool?.quoteSymbol || '--'}?{' '}
            <a href={`/earn/${pool?.chainId}/${pool?.poolId}`} className={'text-green'}>
              [{`m${pool?.quoteSymbol}.${pool?.baseSymbol}`}↗]
            </a>{' '}
          </Trans>
        </Info>
      )}
    </>
  )
}
