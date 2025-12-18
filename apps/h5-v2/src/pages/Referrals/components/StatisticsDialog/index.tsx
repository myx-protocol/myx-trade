import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useState, useEffect } from 'react'
import { encryptionAddress } from '@/utils'
import { getStaticDetail } from '@/api/referrals'
import type { StatisticsType } from '@/api/referrals'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
// import { useFetchLevelList } from '@/hooks/vip/useVipLevel'

const COMMON_USD_ASSETS_LABEL = 'USDC'

export const StatisticsDialog = ({
  open,
  onClose,
  referee,
}: {
  open: boolean
  onClose: () => void
  referee: string
}) => {
  const { configData, accessToken, account } = useReferralStore()
  const [data, setData] = useState<StatisticsType | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && referee && accessToken && account) {
      setLoading(true)
      getStaticDetail(referee, { accessToken, account })
        .then((res: any) => {
          setData(res.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, referee, accessToken, account])

  return (
    <DialogTheme open={open} onClose={onClose}>
      <DialogTitleTheme divider onClose={onClose}>
        <Trans>Statistics</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between border-b border-[#31333D] pb-4">
            <div className="text-sm text-[#CED1D9]">
              <Trans>My Friend</Trans>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-white">{encryptionAddress(referee)}</span>

              <div
                className={`ml-1 rounded-tl rounded-br border px-1.5 py-0.5 text-xs font-medium ${(data?.vipTier ?? 0) >= (configData?.maxVipLevel ?? 0) ? 'border-[#CED1D9] text-[#CED1D9]' : 'border-[#00E3A5] text-[#00E3A5]'}`}
              >
                {`VIP${data?.vipTier ?? 0}`}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-[#CED1D9]">
              <Trans>1-day rebate</Trans>
            </div>
            <div className="text-sm font-medium text-white">
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                `${data?.h24 || '--'} ${COMMON_USD_ASSETS_LABEL}`
              )}
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-[#CED1D9]">
              <Trans>7-day rebate</Trans>
            </div>
            <div className="text-sm font-medium text-white">
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                `${data?.d7 || '--'} ${COMMON_USD_ASSETS_LABEL}`
              )}
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-[#CED1D9]">
              <Trans>30-day rebate</Trans>
            </div>
            <div className="text-sm font-medium text-white">
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                `${data?.d30 || '--'} ${COMMON_USD_ASSETS_LABEL}`
              )}
            </div>
          </div>

          <div className="mt-1 text-xs text-[#CED1D9]">
            <Trans>VIP {configData?.maxVipLevel} or above are not eligible for rebates</Trans>
          </div>

          <div className="mt-5">
            <Button
              className="w-full"
              style={{
                height: '44px',
              }}
              onClick={onClose}
            >
              <Trans>Confirm</Trans>
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
