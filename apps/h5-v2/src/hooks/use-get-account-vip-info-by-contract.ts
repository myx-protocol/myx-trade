import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import { useParams } from 'react-router-dom'
import type { ChainId } from '@/config/chain'
import { useCallback } from 'react'

interface UserVipInfoContract {
  tier: number
  referrer: string
  totalReferralRebatePct: number
  referrerRebatePct: number
  deadline: number
  nonce: number
}

export const useGetAccountVipInfoByContract = (positionChainId?: string) => {
  const { chainId: currentChainId } = useParams()
  const chainId = positionChainId ?? currentChainId
  const { client, clientIsAuthenticated } = useMyxSdkClient(parseInt(chainId as string))
  const { address } = useWalletConnection()

  const getAccountVipInfoByContract = useCallback(async () => {
    if (!client || !clientIsAuthenticated || !address || !chainId) return {} as UserVipInfoContract
    const res = await client?.account.getAccountVipInfo(
      parseInt(chainId) as ChainId,
      address as string,
    )

    const data = res.data ?? {}
    return {
      tier: data[0],
      referrer: data[1],
      totalReferralRebatePct: data[2],
      referrerRebatePct: data[3],
      deadline: data.deadline,
      nonce: data.nonce,
    } as UserVipInfoContract
  }, [client, clientIsAuthenticated, address, chainId])

  return {
    getAccountVipInfoByContract,
  }
}
