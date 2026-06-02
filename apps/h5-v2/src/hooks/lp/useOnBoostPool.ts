import { useCallback, useState } from 'react'
import { pool as Pool } from '@myx-trade/sdk'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { t } from '@lingui/core/macro'
import { isSDKError, showErrorToast } from '@/config/error'
import { toast } from '@/components/UI/Toast'
import { useParams } from 'react-router-dom'

export const useOnBoostPool = ({ onSuccess }: { onSuccess?: () => void }) => {
  const onAction = useWalletActions()
  const { chainId, poolId } = useParams()
  const [boostConfirmBoostOpen, setBoostConfirmBoostOpen] = useState<boolean>(false)

  const onBoostPool = useCallback(async () => {
    try {
      if (!poolId || !chainId) return
      const checked = await onAction()
      if (!checked) return
      await Pool.boostPool({
        chainId: +chainId,
        poolId,
      })
      toast.success({ title: t`Payment successful. Waiting for market launch.` })
      // await Promise.all([refetch])
      setBoostConfirmBoostOpen(false)
      onSuccess?.()
    } catch (e) {
      console.error(e)
      if (isSDKError(e) && e?.error?.message === 'UnexpectedPoolState()') {
        showErrorToast(t`Activation fee already paid.`)
        return
      }
      showErrorToast(e)
    }
  }, [poolId, chainId])

  return {
    boostConfirmBoostOpen,
    setBoostConfirmBoostOpen,
    onBoostPool,
  }
}
