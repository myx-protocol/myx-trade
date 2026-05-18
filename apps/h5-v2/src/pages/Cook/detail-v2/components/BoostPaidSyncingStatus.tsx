import { Trans } from '@lingui/react/macro'

/** 与 OrderTips / BenchWarning 一致：快速启动费已付、等待 boostInfo 同步 */
export const BoostPaidSyncingStatus = () => {
  return (
    <button type="button" disabled className="text-green cursor-not-allowed opacity-50">
      [ <Trans>Paid. Syncing status</Trans>... ]
    </button>
  )
}
