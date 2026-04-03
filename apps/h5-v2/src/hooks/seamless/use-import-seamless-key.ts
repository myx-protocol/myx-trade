import { showErrorToast } from '@/config/error'
import { useCallback, useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { isHex } from 'viem'
import { t } from '@lingui/core/macro'
import { AES, CBC, Pkcs7, Utf8 } from 'crypto-es'
import { charFill, createSeamlessWalletClientFromPrivateKey, getIvMapString } from './utils'
import { useGetSeamlessAuthStatus } from './use-get-seamless-auth-status'

import useGlobalStore from '@/store/globalStore'

export const useImportSeamlessKey = () => {
  const [loading, setLoading] = useState(false)
  const { client } = useMyxSdkClient()
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { symbolInfo } = useGlobalStore()

  const importSeamlessKey = useCallback(
    async ({
      seamlessKey,
      password,
      chainId,
    }: {
      seamlessKey: string
      password: string
      chainId: number
    }) => {
      try {
        setLoading(true)

        if (!isHex(seamlessKey as `0x${string}`) || (seamlessKey as string).length !== 66) {
          showErrorToast(t`Invalid private key`)
          return
        }

        const key = Utf8.parse(charFill(password))
        const iv = getIvMapString()
        const decrypted = AES.decrypt(seamlessKey, key, { iv, mode: CBC, padding: Pkcs7 })
        const privateKey = decrypted.toString(Utf8) as `0x${string}`
        const seamlessWallet = createSeamlessWalletClientFromPrivateKey(privateKey)
        const res = await client?.seamless.getOriginSeamlessAccount(seamlessWallet.address, chainId)

        if (res?.code !== 0) {
          showErrorToast(t`Invalid seamless key`)
        }

        const isAuthorizedRes = await getSeamlessAuthStatus({
          masterAddress: res?.data?.masterAddress,
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

        const originWalletAddress = res?.data?.masterAddress

        return {
          code: 0,
          data: {
            masterAddress: originWalletAddress,
            seamlessAccount: seamlessWallet.address,
            apiKey: seamlessKey,
            seamlessWallet,
          },
        }
      } catch (e) {
        showErrorToast(e)
      } finally {
        setLoading(false)
      }
    },
    [client],
  )

  return {
    importSeamlessKey,
    importSeamlessKeyLoading: loading,
  }
}

// async importSeamlessPrivateKey({ privateKey, password, chainId }: { privateKey: string, password: string, chainId: number }) {
//   if (!isHex(privateKey as `0x${string}`) || (privateKey as string).length !== 66) {
//     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
//   }

//   const wallet = privateKeyToAccount(privateKey as `0x${string}`);
//   const forwarderContract = await getForwarderContract(chainId);
//   const masterAddress = await forwarderContract.read.originAccount([wallet.address]);

//   if (masterAddress === zeroAddress) {
//     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "The private key is not a senseless account");
//   }

//   const isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId);
//   const key = Utf8.parse(charFill(password));
//   const iv = getIvMapString();
//   const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 });
//   const apiKey = encrypted.toString();

//   this.configManager.updateSeamlessWallet({
//     masterAddress,
//     wallet,
//     authorized: isAuthorized,
//   });

//   return {
//     code: 0,
//     data: {
//       masterAddress,
//       seamlessAccount: wallet.address,
//       authorized: isAuthorized,
//       apiKey,
//     },
//   };
// }
