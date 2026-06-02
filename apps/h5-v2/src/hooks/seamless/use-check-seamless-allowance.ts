import { useCallback, useState } from 'react'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useGlobalStore from '@/store/globalStore'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const useCheckSeamlessAllowance = () => {
  const { address, isConnected } = useWalletConnection()
  const { activeSeamlessAddress } = useSeamlessStore()
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const [approving, setApproving] = useState<boolean>(false)
  const checkSeamlessAllowance = useCallback(
    async (_params: {
      chainId: number
      masterAddress: string
      seamlessAddress: string
      quoteToken: string
      amount: string
    }): Promise<boolean> => {
      const isApprove = await client?.seamless?.onCheckRelayer(
        _params.masterAddress,
        _params.seamlessAddress,
        _params.chainId,
        _params.quoteToken,
        _params.amount,
      )
      if (!isApprove) {
        if (!isConnected || address !== activeSeamlessAddress) {
          toast.error({
            title: t`Trading allowance reached`,
            content: t`Please approve a new limit via your wallet.`,
          })
          return false
        }

        try {
          setApproving(true)
          const approvalResult = await client?.seamless?.approveBalance(
            _params.chainId,
            _params.quoteToken,
            _params.amount,
          )
          if (approvalResult?.hash) {
            setApproving(false)
            return true
          } else {
            toast.error({
              title: t`Approve failed`,
              content: t`Please try again.`,
            })
          }
        } catch {
          toast.error({
            title: t`Approve failed`,
            content: t`Please try again.`,
          })
        } finally {
          setApproving(false)
        }
        return false
      }

      return true
    },
    [address, isConnected, activeSeamlessAddress],
  )

  return { checkSeamlessAllowance, approving }
}
