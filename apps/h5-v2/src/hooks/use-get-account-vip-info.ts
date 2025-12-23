import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import useGlobalStore from '@/store/globalStore'

export const useGetAccountVipInfo = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { chainId } = useParams()
  const { address } = useWalletConnection()
  const { userVipInfo } = useGlobalStore()
  const { data } = useSWR(
    {
      key: 'getAccountVipInfo',
      address,
      clientIsAuthenticated,
      nonce: userVipInfo?.nonce,
      vipInfo: userVipInfo,
      deadline: userVipInfo?.deadline,
    },
    async () => {
      if (!client || !clientIsAuthenticated || !address) return {}
      const res = await client?.account.getAccountVipInfoByBackend(
        address as string,
        parseInt(chainId as string),
        userVipInfo?.deadline as number,
        userVipInfo?.nonce as unknown as string,
      )

      return res.data ?? {}
    },
  )

  return {
    vipInfo: data,
  }
}
