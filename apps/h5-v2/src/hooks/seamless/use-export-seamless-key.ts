import { showErrorToast } from '@/config/error'
import { useCallback, useState } from 'react'

import { AES, CBC, Pkcs7, Utf8 } from 'crypto-es'
import { charFill, getIvMapString } from './utils'
import { privateKeyToAccount } from 'viem/accounts'
import { useSeamlessStore } from '@/store/seamless/createStore'

export const useExportSeamlessKey = () => {
  const [loading, setLoading] = useState(false)
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()

  const exportSeamlessKey = useCallback(
    async ({ password, apiKey }: { password: string; apiKey: string }) => {
      try {
        setLoading(true)
        const key = Utf8.parse(charFill(password))
        const iv = getIvMapString()
        const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 })
        const seamlessKey = decrypted.toString(Utf8)
        const wallet = privateKeyToAccount(seamlessKey as `0x${string}`)
        const activeSeamlessAccount = seamlessAccountList.find(
          (item) => item.masterAddress === activeSeamlessAddress,
        )
        if (wallet.address !== activeSeamlessAccount?.seamlessAddress) {
          showErrorToast('Invalid private key')
          return
        }

        return {
          code: 0,
          data: {
            seamlessKey,
          },
        }
      } catch (e) {
        showErrorToast(e)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    exportSeamlessKey,
    exportSeamlessKeyLoading: loading,
  }
}
