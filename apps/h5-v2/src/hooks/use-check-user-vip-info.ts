import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import { useParams } from 'react-router-dom'
import { useCallback } from 'react'
import { useGetAccountVipInfoByContract } from './use-get-account-vip-info-by-contract'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const useCheckUserVipInfo = () => {
  const { chainId } = useParams()
  const { client, clientIsAuthenticated } = useMyxSdkClient(parseInt(chainId as string))
  const { address } = useWalletConnection()
  const { getAccountVipInfoByContract } = useGetAccountVipInfoByContract()
  const checkUserVipInfo = useCallback(async () => {
    if (!client || !clientIsAuthenticated || !address) return {}

    const userVipInfoByContract = await getAccountVipInfoByContract()

    const nonce = parseInt(userVipInfoByContract?.nonce as unknown as string) + 1

    const res = await client?.account.getAccountVipInfoByBackend(
      address as string,
      parseInt(chainId as string),
      userVipInfoByContract?.deadline as number,
      nonce.toString(),
    )

    const vipInfo = res.data ?? {}
    if (
      vipInfo?.vipTier.toString() !== userVipInfoByContract?.tier.toString() ||
      vipInfo?.rebatePct !== userVipInfoByContract?.totalReferralRebatePct ||
      vipInfo?.rebateReferrerPct !== userVipInfoByContract?.referrerRebatePct
    ) {
      const rs = await client?.account.setUserFeeData(
        address as string,
        userVipInfoByContract?.deadline as number,
        {
          tier: vipInfo?.vipTier as number,
          referrer: vipInfo?.rebateAddr as string,
          totalReferralRebatePct: vipInfo?.rebatePct as number,
          referrerRebatePct: vipInfo?.rebateReferrerPct as number,
          nonce: nonce.toString(),
        },
        vipInfo?.signature as string,
      )

      if (rs?.code !== 0) {
        console.log('rs-->', rs)
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
