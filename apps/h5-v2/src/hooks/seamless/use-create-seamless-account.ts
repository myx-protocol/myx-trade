import { useCallback, useState } from 'react'
import { useWalletClient } from 'wagmi'
import {
  calculateSignature,
  generateEthWalletFromHashedSignature,
  charFill,
  createSeamlessWalletClientFromPrivateKey,
  getIvMapString,
} from './utils'
import { Utf8, CBC, Pkcs7, AES } from 'crypto-es'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'

import { showErrorToast } from '@/config/error'
import { t } from '@lingui/core/macro'
import { useGetSeamlessAuthStatus } from './use-get-seamless-auth-status'
import { useWalletConnection } from '../wallet/useWalletConnection'
import useGlobalStore from '@/store/globalStore'

export const useCreateSeamlessAccount = () => {
  const { symbolInfo } = useGlobalStore()
  const { data: walletClient } = useWalletClient()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const [loading, setLoading] = useState(false)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { address } = useWalletConnection()

  const createSeamlessAccount = useCallback(
    async ({ password }: { password: string }) => {
      setLoading(true)
      try {
        const [account] = (await walletClient?.getAddresses()) ?? []

        const createAccountSignature = await walletClient?.signMessage({
          account,
          message: `${account}_${password}`,
        })

        const hashedSignature = await calculateSignature(createAccountSignature ?? '')
        const { privateKey } = generateEthWalletFromHashedSignature(hashedSignature)
        const chainId = symbolInfo?.chainId as number
        if (!chainId) {
          showErrorToast(t`Missing chain`)
          return
        }
        const seamlessWallet = createSeamlessWalletClientFromPrivateKey(privateKey)

        const key = Utf8.parse(charFill(password))
        const iv = getIvMapString()
        const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 })
        const apiKey = encrypted.toString()

        const isAuthorizedRes = await getSeamlessAuthStatus({
          masterAddress: address as string,
          seamlessAddress: seamlessWallet.address,
          chainId,
          tokenAddress: symbolInfo?.quoteToken as string,
        })

        const isAuthorized = isAuthorizedRes?.data?.auth

        if (!isAuthorized) {
          const authRes = await client?.seamless.authorizeSeamlessAccount({
            approve: true,
            seamlessAddress: seamlessWallet.address,
            chainId,
            forwardFeeToken: symbolInfo?.quoteToken as string,
          })
          if (authRes?.code !== 0) {
            showErrorToast(client?.utils.formatErrorMessage(authRes))
            return
          }
        }

        return {
          code: 0,
          data: {
            masterAddress: account,
            seamlessAccount: seamlessWallet.address,
            apiKey,
            seamlessWallet,
          },
        }
      } catch (e) {
        showErrorToast(e)
      } finally {
        setLoading(false)
      }
    },
    [walletClient, client, symbolInfo?.chainId],
  )

  return {
    createSeamlessAccount,
    loading,
  }
}
