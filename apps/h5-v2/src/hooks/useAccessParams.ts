import { useEffect, useMemo, useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useWalletConnection } from './wallet/useWalletConnection'

export const useAccessParams = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { address, isWalletConnected } = useWalletConnection()

  useEffect(() => {
    if (client && clientIsAuthenticated) {
      client
        .getConfigManager()
        .getAccessToken()
        .then((res) => {
          setAccessToken(res)
        })
    }
  }, [client, clientIsAuthenticated])

  return useMemo(() => {
    if (clientIsAuthenticated && isWalletConnected && accessToken && address) {
      return {
        accessToken,
        account: address,
      }
    }
    return null
  }, [clientIsAuthenticated, accessToken, isWalletConnected, address])
}
