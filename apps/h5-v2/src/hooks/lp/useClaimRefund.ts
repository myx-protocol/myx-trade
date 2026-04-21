import { useCallback, useState } from 'react'
import { MarketPoolState, pool as Pool } from '@myx-trade/sdk'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { t } from '@lingui/core/macro'
import { showErrorToast } from '@/config/error'
import { toast } from '@/components/UI/Toast'
import { useParams } from 'react-router-dom'

export const useClaimRefund = () => {
  const onAction = useWalletActions()
  const { chainId, poolId } = useParams()
  const [claimRefundOpen, setClaimRefundOpen] = useState<boolean>(false)

  const onClaimRefund = useCallback(
    async (state: number) => {
      try {
        if (!poolId || !chainId) return
        const checked = await onAction()
        if (!checked) return

        if (state === MarketPoolState.Boosted) {
          console.log('unboost')
          await Pool.unBoostPool({
            chainId: +chainId,
            poolId,
          })
        }
        await Pool.claimBoostFee({
          chainId: +chainId,
          poolId,
        })
        toast.success({ title: t`Refund claim successful` })
        // await Promise.all([refetch])
        setClaimRefundOpen(false)
      } catch (e) {
        console.error(e)
        showErrorToast(e)
      }
    },
    [poolId, chainId],
  )

  return {
    claimRefundOpen,
    setClaimRefundOpen,
    onClaimRefund,
  }
}
