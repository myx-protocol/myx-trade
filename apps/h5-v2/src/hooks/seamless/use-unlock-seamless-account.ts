import { Pkcs7, AES, CBC, Utf8 } from 'crypto-es'
import { useCallback, useState } from 'react'
import { charFill, createSeamlessWalletClientFromPrivateKey, getIvMapString } from './utils'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { showErrorToast } from '@/config/error'
import { useGetSeamlessAuthStatus } from './use-get-seamless-auth-status'
import useGlobalStore from '@/store/globalStore'
import { useGetActivePoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { useParams } from 'react-router-dom'
import { t } from '@lingui/core/macro'

export const useUnlockSeamlessAccount = () => {
  const [loading, setLoading] = useState(false)
  const { client } = useMyxSdkClient()
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { symbolInfo } = useGlobalStore()
  const { poolList } = useGetActivePoolList()
  const { chainId: routeChainId, poolId: routePoolId } = useParams()

  const unlockSeamlessAccount = useCallback(
    async ({
      masterAddress,
      password,
      apiKey,
      chainId,
    }: {
      masterAddress: string
      password: string
      apiKey: string
      chainId: number
    }) => {
      try {
        setLoading(true)
        const key = Utf8.parse(charFill(password))
        const iv = getIvMapString()
        const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 })
        const privateKey = decrypted.toString(Utf8) as `0x${string}`
        const seamlessWallet = createSeamlessWalletClientFromPrivateKey(privateKey)
        const currentChainId = chainId || Number(routeChainId)
        const currentPool = poolList.find(
          (item: any) =>
            item.poolId === routePoolId &&
            (!currentChainId || Number(item.chainId) === Number(currentChainId)),
        )
        const quoteToken = symbolInfo?.quoteToken || currentPool?.quoteToken

        if (!currentChainId || !quoteToken) {
          showErrorToast(t`Market info not ready, please try again`)
          return
        }

        const isAuthorizedRes = await getSeamlessAuthStatus({
          masterAddress,
          seamlessAddress: seamlessWallet.address,
          chainId: currentChainId,
          tokenAddress: quoteToken as string,
        })

        const isAuthorized = isAuthorizedRes?.data?.auth

        if (!isAuthorized) {
          const authRes = await client?.seamless.authorizeSeamlessAccount({
            approve: true,
            seamlessAddress: seamlessWallet.address,
            chainId: currentChainId,
            forwardFeeToken: quoteToken as string,
          })
          if (authRes?.code !== 0) {
            if (authRes?.message !== 'User Rejected') {
              showErrorToast(client?.utils.formatErrorMessage(authRes))
            }
            return
          }
        }

        return {
          code: 0,
          data: {
            masterAddress,
            seamlessAccount: seamlessWallet.address,
            seamlessWallet,
          },
        }
      } catch (e) {
        showErrorToast(e)
      } finally {
        setLoading(false)
      }
    },
    [client, getSeamlessAuthStatus, poolList, routeChainId, routePoolId, symbolInfo?.quoteToken],
  )

  return {
    unlockSeamlessAccount,
    unlockSeamlessAccountLoading: loading,
  }
}
