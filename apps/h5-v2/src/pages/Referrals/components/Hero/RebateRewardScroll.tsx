import { Trans } from '@lingui/macro'
import { Skeleton } from '@/components/UI/Skeleton'
import User from '@/components/Icon/set/User'
import Marquee from 'react-fast-marquee'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { formatNumberPrecision } from '@/utils/formatNumber'
import { encryptionAddress } from '@/utils'
import { useEffect } from 'react'
import type { RefClaimRecordInfo } from '@/store/referrals'

const COMMON_TRANSLATE_USDC_ASSETS_SCALE = 2

export function RebateRewardScroll() {
  const { recentClaims, fetchRecentClaims, isLoadingClaims, accessToken } = useReferralStore()
  const accessParams = useAccessParams()

  useEffect(() => {
    if (accessToken) {
      fetchRecentClaims()
    }
  }, [accessToken, fetchRecentClaims])

  const claimList = recentClaims

  if (isLoadingClaims) {
    return (
      <div className="flex overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mx-2 flex items-center gap-1 rounded-full bg-[#202129] px-3 py-2">
            <Skeleton className="h-[14px] w-[14px] rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (!claimList || claimList.length <= 0) {
    return null
  }

  return (
    <Marquee pauseOnHover>
      <div className="flex">
        {claimList.map((claim, i) => {
          return <RebateRewardCard key={`${claim.amount}_${i}`} info={claim} />
        })}
      </div>
    </Marquee>
  )
}

function RebateRewardCard({ info }: { info: RefClaimRecordInfo }) {
  return (
    <div className="mx-2 flex items-center gap-1 rounded-full bg-[#202129] px-3 py-2 text-[#CED1D9]">
      <User size={14} className="text-[14px]" />
      <div className="text-xs leading-none">{encryptionAddress(info.account)}</div>
      <div className="text-xs leading-none">
        <Trans>
          claimed{' '}
          <span className="font-bold text-[#FFD700]">
            {formatNumberPrecision(info.amount, COMMON_TRANSLATE_USDC_ASSETS_SCALE)} {info.token}
          </span>{' '}
          Rebate reward
        </Trans>
      </div>
    </div>
  )
}
