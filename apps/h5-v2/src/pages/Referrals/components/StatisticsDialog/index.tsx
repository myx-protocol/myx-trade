import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { Trans } from '@lingui/macro'
import { useState, useEffect } from 'react'
import { encryptionAddress } from '@/utils'
import { getStaticDetail } from '@/api/referrals'
import type { StatisticsType } from '@/api/referrals'
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
  const accessParams = useAccessParams()
  const [data, setData] = useState<StatisticsType | null>(null)
  const [loading, setLoading] = useState(false)
  const [vipData, setVipData] = useState<any | null>(null)

  // const { levelList, isLoading: levelInfoListLoading } = useFetchLevelList?.() || { levelList: [], isLoading: false }
  const { levelList, isLoading: levelInfoListLoading } = {
    levelList: [] as any[],
    isLoading: false,
  }

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

      // if (api?.vip?.getUsingGet1) {
      //   api.vip.getUsingGet1({ account: referee }).then((res: any) => {
      //     setVipData(res?.data?.data)
      //   })
      // }
    }
  }, [open, referee, accessToken, account])

  const levelInfo = levelList.find((info: any) => info?.level === vipData?.levelId) || levelList[0]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ style: { background: '#202129', color: 'white' } }}
    >
      <DialogTitle className="flex items-center justify-between border-b border-[#31333D]">
        <Trans>Statistics</Trans>
        <div onClick={onClose} className="cursor-pointer text-[#CED1D9] hover:text-white">
          X
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between border-b border-[#31333D] pb-4">
            <div className="text-sm text-[#CED1D9]">
              <Trans>My Friend</Trans>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-white">{encryptionAddress(referee)}</span>
              {(levelInfo?.level || levelInfo?.level === 0) && !levelInfoListLoading && (
                <div
                  className={`ml-1 rounded-tl rounded-br border px-1.5 py-0.5 text-xs font-medium ${(vipData?.levelId ?? 0) >= (configData?.maxVipLevel ?? 0) ? 'border-[#CED1D9] text-[#CED1D9]' : 'border-[#00E3A5] text-[#00E3A5]'}`}
                >
                  {`VIP${levelInfo?.level ?? 0}`}
                </div>
              )}
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
            <Button className="w-full" onClick={onClose}>
              <Trans>Confirm</Trans>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
