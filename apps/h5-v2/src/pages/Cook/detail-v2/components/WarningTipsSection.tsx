import { Trans } from '@lingui/react/macro'
import { TipBox } from './TipBox'
import { PoolSecurityState } from '@/request/lp/type'

interface WarningTipsSectionProps {
  /** 与 CookDetailOrderTips 中安全提示一致：非 UNKNOWN/NOT_SECURITY 时才展示募集提示 */
  securityState?: PoolSecurityState
  isDeposit: boolean
  progressTotal: number
  progressCurrent: number
  progressRemainingDisplay: string
  boostFeeDisplay: string
  boostFeeUsd: number
}

export const WarningTipsSection = ({
  securityState,
  isDeposit,
  progressTotal,
  progressCurrent,
  progressRemainingDisplay,
  boostFeeDisplay,
  boostFeeUsd,
}: WarningTipsSectionProps) => {
  return (
    <>
      {securityState !== PoolSecurityState.UNKNOWN &&
        securityState !== PoolSecurityState.NOT_SECURITY &&
        isDeposit &&
        progressTotal > 0 &&
        progressCurrent < progressTotal && (
          <TipBox>
            <Trans>还差</Trans>
            <span className="mx-[4px] text-[#FFCD7A]">${progressRemainingDisplay}</span>
            <Trans>达到启动阈值，可快速达成募集并开盘。</Trans>
            {boostFeeUsd > 0 && (
              <>
                <Trans>也可以支付</Trans>
                <span className="mx-[4px] text-[#FFCD7A]">${boostFeeDisplay}</span>
                <Trans>提前启动市场。</Trans>
              </>
            )}
          </TipBox>
        )}
    </>
  )
}
