import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'

export const useGetAccountVipInfo = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { chainId } = useParams()
  const { address } = useWalletConnection()
  const { data } = useSWR(
    {
      key: 'getAccountVipInfo',
      address,
      clientIsAuthenticated,
    },
    async () => {
      if (!client || !clientIsAuthenticated || !address) return {}
      const res = await client?.account.getAccountVipInfoByBackend(
        address as string,
        parseInt(chainId as string),
      )

      return res.data ?? {}
    },
  )

  return {
    vipInfo: data,
  }
}
