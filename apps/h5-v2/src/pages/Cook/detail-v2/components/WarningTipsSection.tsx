import { Trans } from '@lingui/react/macro'
import { BoostPaidSyncingStatus } from './BoostPaidSyncingStatus'
import { TipBox } from './TipBox'
import { PoolSecurityState } from '@/request/lp/type'

interface WarningTipsSectionProps {
  /** 与 CookDetailOrderTips 中安全提示一致：非 UNKNOWN/NOT_SECURITY 时才展示募集提示 */
  securityState?: PoolSecurityState
  isDeposit: boolean
  /** 快速启动费已付且 boostInfo 已同步后由 CookDetailOrderTips 承接，此处隐藏 */
  isBoostActivationRequested?: boolean
  /** 链上已付、boostInfo 尚未同步 */
  isOnBoostSuccess?: boolean
  progressTotal: number
  progressCurrent: number
  progressRemainingDisplay: string
  boostFeeDisplay: string
  boostFeeUsd: number
  /** 点击「去激活」直接打开快速启动确认弹窗 */
  onOpenQuickActivateDialog?: () => void
}

export const WarningTipsSection = ({
  securityState,
  isDeposit,
  isBoostActivationRequested,
  isOnBoostSuccess,
  progressTotal,
  progressCurrent,
  progressRemainingDisplay,
  boostFeeDisplay,
  boostFeeUsd,
  onOpenQuickActivateDialog,
}: WarningTipsSectionProps) => {
  const showFundraisingTip =
    securityState !== PoolSecurityState.UNKNOWN &&
    securityState !== PoolSecurityState.NOT_SECURITY &&
    !isBoostActivationRequested &&
    progressTotal > 0 &&
    progressCurrent < progressTotal &&
    /** 存入 Tab 常态展示；付款同步中在赎回/激活 Tab 也保留完整募集文案 */
    (isDeposit || isOnBoostSuccess)

  return (
    <>
      {showFundraisingTip && (
        <TipBox>
          <Trans>还差</Trans>
          <span className="mx-[4px] text-[#FFCD7A]">${progressRemainingDisplay}</span>
          <Trans>达到启动阈值，可快速达成募集并开盘。</Trans>
          {boostFeeUsd > 0 &&
            (isOnBoostSuccess ? (
              <BoostPaidSyncingStatus />
            ) : (
              <>
                <Trans>也可以支付</Trans>
                <span className="mx-[4px] text-[#FFCD7A]">${boostFeeDisplay}</span>
                <Trans>提前启动市场。</Trans>
                {onOpenQuickActivateDialog && (
                  <button
                    type="button"
                    className="text-green ml-[4px] cursor-pointer"
                    onClick={onOpenQuickActivateDialog}
                  >
                    [ <Trans>去激活</Trans> → ]
                  </button>
                )}
              </>
            ))}
        </TipBox>
      )}
    </>
  )
}
