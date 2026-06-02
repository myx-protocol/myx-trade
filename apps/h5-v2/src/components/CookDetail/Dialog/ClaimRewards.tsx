import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import type { LpAsset } from '@/request/lp/type.ts'
import { useCallback, useState } from 'react'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { base as Base } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS, MIN_CLAIM_AMOUNT } from '@/constant/decimals.ts'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { showErrorToast } from '@/config/error'
import Big from 'big.js'
import { FlexRowLayout } from '@/components/FlexRowLayout'

type Rewards = { rebates: string; genesisRebates: string }
interface ClaimRewardsDialogProps {
  open: boolean
  onClose: () => void
  lpAsset?: LpAsset
  reward?: Rewards
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
  const onAction = useWalletActions()

  const onHandleClaim = useCallback(async () => {
    if (
      !lpAsset?.poolId ||
      !account ||
      !reward ||
      new Big(reward?.rebates || '0')?.plus(reward?.genesisRebates || '0')?.toNumber() <
        MIN_CLAIM_AMOUNT
    )
      return
    try {
      setLoading(true)
      const checked = onAction(lpAsset.chainId)
      if (!checked) return
      await Base.claimBasePoolRebate({ chainId: lpAsset.chainId, poolId: lpAsset.poolId })
      toast.success({ title: t`Claim successfully claimed` })
      refetch?.()
      onClose()
    } catch (e) {
      showErrorToast(e)
    } finally {
      setLoading(false)
    }
  }, [lpAsset?.chainId, lpAsset?.poolId, reward, account, refetch, onAction])
  return (
    <DialogBase title={t`领取收益`} open={open} onClose={onClose}>
      <div className="mt-[16px] leading-[1]">
        <p className="text-[14px] font-medium text-[#848E9C]">
          <Trans>Claimable Amount</Trans>
        </p>
        {/* value */}
        <p className="mt-[8px] text-[24px] font-bold text-white">
          {formatNumberPrecision(
            new Big(reward?.rebates || '0')?.plus(reward?.genesisRebates || 0)?.toNumber(),
            COMMON_PRICE_DISPLAY_DECIMALS,
          )}
          <span className="ml-[4px]">{lpAsset?.quoteSymbol}</span>
        </p>
        {/* rate */}
        <p className="mt-[8px] text-[14px] font-medium text-[#848E9C]">
          $
          {formatNumberPrecision(
            new Big(reward?.rebates || '0')?.plus(reward?.genesisRebates || 0)?.toNumber(),
            COMMON_PRICE_DISPLAY_DECIMALS,
          )}
        </p>
      </div>
      {/* profit detail */}
      <div className="mt-[32px] pb-[20px] text-[12px] leading-[1.2] font-medium text-white">
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Genesis Rewards</Trans>
            </p>
          }
          right={
            <p>
              {formatNumberPrecision(reward?.genesisRebates, COMMON_PRICE_DISPLAY_DECIMALS)}{' '}
              {lpAsset?.quoteSymbol}
            </p>
          }
        />
        <FlexRowLayout
          className="mt-[12px]"
          left={
            <p className="text-[#848E9C]">
              <Trans>Liquidity Yield</Trans>
            </p>
          }
          right={
            <p>
              {formatNumberPrecision(reward?.rebates, COMMON_PRICE_DISPLAY_DECIMALS)}{' '}
              {lpAsset?.quoteSymbol}
            </p>
          }
        />
      </div>
      <PrimaryButton
        id="cook_detail_claim_rewards_btn_h5"
        data-analytics="cook_detail_claim_rewards_btn_h5"
        loading={loading}
        disabled={
          !reward ||
          new Big(reward?.rebates || '0')?.plus(reward?.genesisRebates || 0)?.toNumber() <
            MIN_CLAIM_AMOUNT
        }
        className="mt-[20px]! h-[44px] w-full rounded-[999px]! text-[14px]! font-medium!"
        onClick={onHandleClaim}
      >
        <Trans>Claim Now</Trans>
      </PrimaryButton>
    </DialogBase>
  )
}
