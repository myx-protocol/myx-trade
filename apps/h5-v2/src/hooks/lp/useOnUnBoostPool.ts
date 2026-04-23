import { useCallback, useState } from 'react'
import { pool as Pool } from '@myx-trade/sdk'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { t } from '@lingui/core/macro'
import { isSDKError, showErrorToast } from '@/config/error'
import { toast } from '@/components/UI/Toast'
import { useParams } from 'react-router-dom'

export const useOnUnBoostPool = () => {
  const onAction = useWalletActions()
  const { chainId, poolId } = useParams()
  const [unBoostConfirmBoostOpen, setUnBoostConfirmBoostOpen] = useState<boolean>(false)

  const onUnBoostPool = useCallback(async () => {
    try {
      if (!poolId || !chainId) return
      const checked = await onAction()
      if (!checked) return
      await Pool.unBoostPool({
        chainId: +chainId,
        poolId,
      })
      await Pool.claimBoostFee({
        chainId: +chainId,
        poolId,
      })
      toast.success({ title: t`Refund claim successful` })
      // await Promise.all([refetch])
      setUnBoostConfirmBoostOpen(false)
    } catch (e) {
      console.error(e)
      // if (isSDKError(e) &&  e?.error?.message === 'BoostFeeClaimFailed()'){
      //   showErrorToast(t`Refund already claimed.`)
      //   return
      // }
      showErrorToast(e)
    }
  }, [poolId, chainId])

  return {
    unBoostConfirmBoostOpen,
    setUnBoostConfirmBoostOpen,
    onUnBoostPool,
  }
}
