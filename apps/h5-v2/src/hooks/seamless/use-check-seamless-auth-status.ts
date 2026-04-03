import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useGlobalStore from '@/store/globalStore'
import { useCallback, useState } from 'react'

export const useCheckSeamlessAuthStatus = () => {
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const [loading, setLoading] = useState(false)
  const checkSeamlessAuthStatus = useCallback(
    async ({
      masterAddress,
      seamlessAddress,
      chainId,
      tokenAddress,
    }: {
      masterAddress: string
      seamlessAddress: string
      chainId: number
      tokenAddress: string
    }) => {
      setLoading(true)
      const isAuthorized = await client?.seamless.onCheckRelayer(
        masterAddress,
        seamlessAddress,
        chainId,
        tokenAddress,
      )
      return isAuthorized
    },
    [client],
  )

  return {
    checkSeamlessAuthStatus,
    seamlessAuthLoading: loading,
  }
}
