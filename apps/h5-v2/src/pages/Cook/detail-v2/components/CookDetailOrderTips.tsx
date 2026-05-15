import { Info, SecurityWarning } from '@/components/CookDetail/Order/OrderTips'
import { MYX_CONTACT_SUPPORT, MYX_DELISTING_RULES_LINK } from '@/config/link'
import { BoostType, PoolBaseState, PoolSecurityState } from '@/request/lp/type.ts'
import type { BaseLpDetail, MarketPoolRiskLevelConfig, PoolBoostInfo } from '@/request/lp/type.ts'
import type { MarketInfo, MarketPool } from '@myx-trade/sdk'
import { MarketPoolState } from '@myx-trade/sdk'
import { isCookState } from '@/utils/cook.ts'
import { cutDownFormat } from '@/utils/timeFormat.ts'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { formatNumber } from '@/utils/number.ts'
import { Trans } from '@lingui/react/macro'
import { Tips } from '@/pages/Market/components/tips.tsx'
import { useCountDown } from 'ahooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Big } from 'big.js'
import { isAddressEqual } from 'viem'
import type { Address } from '@/request/type.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'

type PoolInfoTvl = {
  totalTvl?: string
  baseTvl?: string
  quoteTvl?: string
}

export interface CookDetailOrderTipsProps {
  securityState?: PoolSecurityState
  baseLpDetail?: BaseLpDetail
  pool?: MarketPool
  poolInfoTvl?: PoolInfoTvl
  markets?: MarketInfo[]
  riskLevelConfig?: MarketPoolRiskLevelConfig | null
  boostedPrimeTvl?: string
  boostInfo?: PoolBoostInfo | null
  genesisFeeRate: string
  refetchLpDetail: () => Promise<unknown>
  onOpenViewLaunchStatus: () => void
  onOpenClaimRefund: () => void
}

export const CookDetailOrderTips = ({
  securityState,
  baseLpDetail,
  pool,
  poolInfoTvl,
  markets,
  riskLevelConfig,
  boostedPrimeTvl,
  boostInfo,
  genesisFeeRate,
  refetchLpDetail,
  onOpenViewLaunchStatus,
  onOpenClaimRefund,
}: CookDetailOrderTipsProps) => {
  const { address: account } = useWalletConnection()
  const [targetDate, setTargetDate] = useState<number>()

  const [countdown] = useCountDown({
    targetDate,
    onEnd: useCallback(async () => {
      await refetchLpDetail()
    }, [refetchLpDetail]),
  })

  const market = useMemo(() => {
    return (markets || []).find((m) => m.marketId === baseLpDetail?.marketId)
  }, [markets, baseLpDetail?.marketId])

  const genesis = useMemo(() => {
    if (market?.poolPrimeThreshold && poolInfoTvl) {
      const _genesis = new Big(Number(market.poolPrimeThreshold))
        .minus(new Big(poolInfoTvl?.totalTvl || '0'))
        .toString()
      return Number(_genesis) < 0 ? 0 : _genesis
    }
    return -1
  }, [market?.poolPrimeThreshold, poolInfoTvl])

  useEffect(() => {
    if (baseLpDetail?.state === MarketPoolState.PreBench) {
      setTargetDate((baseLpDetail.poolPreTime + 24 * 60 * 60) * 1000)
    } else {
      setTargetDate(undefined)
    }
  }, [baseLpDetail?.state, baseLpDetail?.poolPreTime])

  const showCookLifecycleTips =
    securityState !== PoolSecurityState.UNKNOWN &&
    securityState !== PoolSecurityState.NOT_SECURITY &&
    !!baseLpDetail &&
    baseLpDetail.state !== MarketPoolState.Trench &&
    !(baseLpDetail.state === MarketPoolState.PreBench && !targetDate) &&
    !(
      baseLpDetail &&
      isCookState(baseLpDetail.state) &&
      (!market?.poolPrimeThreshold || !pool || !poolInfoTvl)
    )

  return (
    <>
      {securityState === PoolSecurityState.UNKNOWN && <SecurityWarning className="mt-[16px]" />}
      {securityState === PoolSecurityState.NOT_SECURITY && (
        <Tips className="mt-[16px]" showIcon={false}>
          ⚠️ <Trans>Security Warning:</Trans>{' '}
          <Trans>
            This token carries extreme risks. For asset safety, contract trading and liquidity
            provision are not supported.{' '}
            <a href={MYX_CONTACT_SUPPORT} target="_blank" rel="noreferrer" className={'text-green'}>
              Contact support
            </a>{' '}
            for assistance.
          </Trans>
        </Tips>
      )}

      {showCookLifecycleTips && baseLpDetail && (
        <>
          {pool &&
            isCookState(baseLpDetail.state) &&
            riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
            Number(genesis) >= 0 &&
            boostInfo?.type !== BoostType.Requested && (
              <Info className="mt-[16px]">
                <Trans>
                  Only{' '}
                  <span className={'text-warning mr-[0.5em]'}>
                    $
                    {formatNumber(genesis, {
                      showUnit: true,
                    })}
                  </span>{' '}
                  {baseLpDetail?.mBaseQuoteSymbol || '--'} Genesis Shares left to activate the
                  market! Join now to lock in a LIFETIME{' '}
                  <span className={'text-warning mx-[0.5em]'}>
                    {formatNumberPercent(genesisFeeRate, 0, false)}
                  </span>
                  fee share!
                </Trans>
              </Info>
            )}

          {pool &&
            isCookState(baseLpDetail.state) &&
            boostedPrimeTvl &&
            riskLevelConfig?.baseState !== PoolBaseState.PRIME_FAIL &&
            Number(genesis) >= 0 &&
            boostInfo?.type === BoostType.Requested &&
            (new Big(poolInfoTvl?.totalTvl || '0').gte(boostedPrimeTvl || '0') ? (
              <Info className="mt-[16px]">
                <Trans>
                  Market launch fee paid and TVL threshold met! Waiting for smart contract execution
                  to force start trading.{' '}
                  {account &&
                    boostInfo?.proposer &&
                    isAddressEqual(boostInfo.proposer as Address, account as Address) && (
                      <button
                        type="button"
                        className={'text-green cursor-pointer'}
                        onClick={() => {
                          onOpenViewLaunchStatus()
                        }}
                      >
                        [ <Trans>View Status</Trans> → ]
                      </button>
                    )}
                </Trans>
              </Info>
            ) : (
              <Info className="mt-[16px]">
                <Trans>
                  Market launch fee paid! Only{' '}
                  <span className="text-warning">
                    $
                    {formatNumber(
                      Big(boostedPrimeTvl)
                        .minus(poolInfoTvl?.totalTvl || '0')
                        .toString(),
                      { showUnit: false },
                    )}{' '}
                    more TVL
                  </span>{' '}
                  needed to force start trading. Join now to lock in a LIFETIME{' '}
                  {formatNumberPercent(genesisFeeRate, 0, false)} fee share!{' '}
                  {account &&
                    boostInfo?.proposer &&
                    isAddressEqual(boostInfo.proposer as Address, account as Address) && (
                      <button
                        type="button"
                        className={'text-green cursor-pointer'}
                        onClick={() => {
                          onOpenViewLaunchStatus()
                        }}
                      >
                        [ <Trans>View Status</Trans> → ]
                      </button>
                    )}
                </Trans>
              </Info>
            ))}

          {pool &&
            isCookState(baseLpDetail.state) &&
            riskLevelConfig?.baseState === PoolBaseState.PRIME_FAIL &&
            boostInfo?.type === BoostType.Requested && (
              <Info className="mt-[16px]">
                <Trans>
                  Market Opening Failed! You have{' '}
                  {formatNumber(market?.boostRefundFeeUsd, { showUnit: false })} {pool?.quoteSymbol}{' '}
                  funds pending.👉{' '}
                  {account &&
                    boostInfo?.proposer &&
                    isAddressEqual(boostInfo.proposer as Address, account as Address) && (
                      <button
                        type="button"
                        className={'text-green cursor-pointer'}
                        onClick={() => {
                          onOpenClaimRefund()
                        }}
                      >
                        [ <Trans>Claim Refund Now</Trans> ↗ ]
                      </button>
                    )}
                </Trans>
              </Info>
            )}

          {baseLpDetail.state === MarketPoolState.Primed && (
            <Info className="mt-[16px]">
              <Trans>
                The {baseLpDetail.symbolName} perpetual market is currently preparing to go live.
                Buy {baseLpDetail.mBaseQuoteSymbol} now to lock in your share and start earning
                immediately once trading opens.
              </Trans>
            </Info>
          )}

          {baseLpDetail.state === MarketPoolState.PreBench && (
            <Info className="mt-[16px]">
              <Trans>
                Due to the monthly trading volume not meeting the requirement, the{' '}
                {baseLpDetail.mBaseQuoteSymbol} market will be delisted in{' '}
                {cutDownFormat(dayjs.duration(countdown))}. After delisting, buys will be suspended.
                Your ability to sell will not be affected.{' '}
                <a
                  className={'text-green'}
                  href={MYX_DELISTING_RULES_LINK}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Delisting Rules
                </a>
              </Trans>
            </Info>
          )}

          {baseLpDetail.state === MarketPoolState.Bench && (
            <Info className="mt-[16px]">
              <Trans>
                Due to [Reason for Delisting], new buys for this market have been paused. You can
                still sell your holdings at any time.
                <a
                  href={`/market/${baseLpDetail.chainId}/${baseLpDetail.baseToken}`}
                  className={'text-green ml-[0.5em] inline-block'}
                >
                  Reactivate Market
                </a>
              </Trans>
            </Info>
          )}
        </>
      )}
    </>
  )
}
