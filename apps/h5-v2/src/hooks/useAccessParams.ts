import { useEffect, useMemo, useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useWalletConnection } from './wallet/useWalletConnection'

export const useAccessParams = () => {
  const { client, clientIsAuthenticated, clientIsAuthenticatedAddress } = useMyxSdkClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { isWalletConnected } = useWalletConnection()

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
    if (clientIsAuthenticated && isWalletConnected && clientIsAuthenticatedAddress) {
      return {
        accessToken: accessToken || '',
        account: clientIsAuthenticatedAddress,
      }
    }
    return null
  }, [clientIsAuthenticated, accessToken, isWalletConnected, clientIsAuthenticatedAddress])
}
