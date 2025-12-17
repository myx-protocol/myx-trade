import { useCallback } from 'react'
import { isProdMode } from '@/utils/env'
import { ChainId } from '@/config/chain'
import { getBalanceOf, parseUnits } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import { getMineStakingMyx } from '@/request/vip'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import Address from '@/config/address'
import { useAccessToken } from '@/hooks/useAccessToken.ts'

export const targetChainId = isProdMode() ? ChainId.BSC_MAINNET : ChainId.BSC_TESTNET

export const useMYXBalance = () => {
  const { address: account } = useWalletConnection()
  const { accessToken } = useAccessToken()
  // const { activeWalletMode } = useWalletStore()

  const { data: StakingMyx } = useQuery({
    queryKey: [
      {
        accessToken,
        account,
        key: 'StakingMyx',
      },
    ],
    queryFn: async () => {
      if (!accessToken || !account) return 0n
      const res = await getMineStakingMyx()
      return parseUnits(res?.data || '0')
    },
  })

  const { data: walletBalance } = useQuery({
    queryKey: [
      {
        accessToken,
        account,
        key: 'WalletMYXBalance',
      },
    ],
    queryFn: async () => {
      const myxTokenAddress = Address?.[targetChainId as keyof typeof Address]?.MYX_ADDRESS
      if (!myxTokenAddress || !account || !accessToken) return 0n
      const balance = await getBalanceOf(targetChainId, account, myxTokenAddress)

      return balance || 0n
    },
  })

  const getMYXBalance = useCallback(async () => {
    if (!walletBalance) return 0n
    const data = walletBalance + (StakingMyx || 0n)
    return data
  }, [StakingMyx, walletBalance])

  return { getMYXBalance }
}
