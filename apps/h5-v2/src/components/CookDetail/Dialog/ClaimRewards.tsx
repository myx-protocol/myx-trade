import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import type { LpAsset } from '@/request/lp/type.ts'
import { useCallback, useState } from 'react'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { base as Base } from '@myx-trade/sdk'
import { toast } from 'react-hot-toast'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck.ts'

interface ClaimRewardsDialogProps {
  open: boolean
  onClose: () => void
  lpAsset?: LpAsset
  reward?: string
  refetch?: () => void
}

export const ClaimRewardsDialog = ({
  open,
  onClose,
  lpAsset,
  reward,
  refetch,
}: ClaimRewardsDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { address: account } = useWalletConnection()
  const { checkWalletChainId } = useWalletChainCheck()

  const onHandleClaim = useCallback(async () => {
    if (!lpAsset?.poolId || !account || !reward) return
    try {
      setLoading(true)
      await checkWalletChainId(lpAsset.chainId)
      await Base.claimBasePoolRebate({ chainId: lpAsset.chainId, poolId: lpAsset.poolId })
      toast.success('Claim successfully claimed')
      refetch?.()
    } catch (e) {
      toast.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [lpAsset?.chainId, lpAsset?.poolId, account, refetch, checkWalletChainId])
  return (
    <DialogBase title={t`领取收益`} open={open} onClose={onClose} width={390}>
      <div className="mt-[16px] leading-[1]">
        <p className="text-[14px] font-medium text-[#848E9C]">
          <Trans>Claimable Amount</Trans>
        </p>
        {/* value */}
        <p className="mt-[8px] text-[24px] font-bold text-white">
          {formatNumberPrecision(reward, COMMON_PRICE_DISPLAY_DECIMALS)}
          <span className="ml-[4px]">{lpAsset?.quoteSymbol}</span>
        </p>
        {/* rate */}
        <p className="mt-[8px] text-[14px] font-medium text-[#848E9C]">
          ${formatNumberPrecision(reward, COMMON_PRICE_DISPLAY_DECIMALS)}
        </p>
      </div>
      {/* profit detail */}
      {/*<div className="mt-[32px] pb-[20px] text-[12px] leading-[1.2] font-medium text-white">
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>创世收益</Trans>
            </p>
          }
          right={<p>70 mTRUMP($23.32)</p>}
        />
        <FlexRowLayout
          className="mt-[12px]"
          left={
            <p className="text-[#848E9C]">
              <Trans>普通收益</Trans>
            </p>
          }
          right={<p>70 mTRUMP($23.32)</p>}
        />
      </div>*/}
      <PrimaryButton
        loading={loading}
        disabled={!reward}
        className="mt-[20px]! h-[44px] w-full rounded-[999px]! text-[14px]! font-medium!"
        onClick={onHandleClaim}
      >
        <Trans>Claim Now</Trans>
      </PrimaryButton>
    </DialogBase>
  )
}
