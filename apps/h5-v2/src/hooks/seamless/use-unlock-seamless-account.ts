import { Pkcs7, AES, CBC, Utf8 } from 'crypto-es'
import { useCallback, useState } from 'react'
import { charFill, createSeamlessWalletClientFromPrivateKey, getIvMapString } from './utils'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { showErrorToast } from '@/config/error'
import { useGetSeamlessAuthStatus } from './use-get-seamless-auth-status'
import useGlobalStore from '@/store/globalStore'

export const useUnlockSeamlessAccount = () => {
  const [loading, setLoading] = useState(false)
  const { client } = useMyxSdkClient()
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { symbolInfo } = useGlobalStore()

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

        const isAuthorizedRes = await getSeamlessAuthStatus({
          masterAddress,
          seamlessAddress: seamlessWallet.address,
          chainId,
          tokenAddress: symbolInfo?.quoteToken as string,
        })

        const isAuthorized = isAuthorizedRes?.data?.auth

        if (!isAuthorized) {
          await client?.seamless.authorizeSeamlessAccount({
            approve: true,
            seamlessAddress: seamlessWallet.address,
            chainId,
            forwardFeeToken: symbolInfo?.quoteToken as string,
          })
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
        console.log('e-->', e)
        showErrorToast(e)
      } finally {
        setLoading(false)
      }
    },
    [client],
  )

  return {
    unlockSeamlessAccount,
    unlockSeamlessAccountLoading: loading,
  }
}
