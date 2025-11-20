import { useEffect, useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'

export const useAccessToken = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const getAccessToken = async () => {
    const accessToken = await client?.getConfigManager()?.getAccessToken()
    if (accessToken) {
      setAccessToken(accessToken)
    }
  }

  useEffect(() => {
    if (client && clientIsAuthenticated) {
      getAccessToken().then()
    }
  }, [client, clientIsAuthenticated])

  return { accessToken }
}
