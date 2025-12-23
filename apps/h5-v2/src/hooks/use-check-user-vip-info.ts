import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import { useParams } from 'react-router-dom'
import { useCallback } from 'react'
import { useGetAccountVipInfoByContract } from './use-get-account-vip-info-by-contract'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const useCheckUserVipInfo = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { chainId } = useParams()
  const { address } = useWalletConnection()
  const { getAccountVipInfoByContract } = useGetAccountVipInfoByContract()
  const checkUserVipInfo = useCallback(async () => {
    if (!client || !clientIsAuthenticated || !address) return {}

    const userVipInfoByContract = await getAccountVipInfoByContract()

    console.log('userVipInfoByContract-->', userVipInfoByContract)
    const res = await client?.account.getAccountVipInfoByBackend(
      address as string,
      parseInt(chainId as string),
      userVipInfoByContract?.deadline as number,
      userVipInfoByContract?.nonce as unknown as string,
    )

    const vipInfo = res.data ?? {}
    if (vipInfo?.vipTier.toString() !== userVipInfoByContract?.tier.toString()) {
      const rs = await client?.account.setUserFeeData(
        address as string,
        userVipInfoByContract?.deadline as number,
        {
          tier: vipInfo?.vipTier as number,
          referrer: vipInfo?.rebateAddr as string,
          totalReferralRebatePct: vipInfo?.rebateReturnPct as number,
          referrerRebatePct: vipInfo?.rebatePct as number,
          nonce: userVipInfoByContract?.nonce as unknown as string,
        },
        vipInfo?.signature as string,
      )

      if (rs?.code !== 0) {
        toast.error({
          title: t`${client.utils.formatErrorMessage(rs)}`,
        })
      }
    }
  }, [client, clientIsAuthenticated, address, chainId])

  return {
    checkUserVipInfo,
  }
}
