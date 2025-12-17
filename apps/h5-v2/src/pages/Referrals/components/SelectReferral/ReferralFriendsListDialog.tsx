import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'
import { Trans, t } from '@lingui/macro'
import { useState, useEffect } from 'react'
import { toast } from '@/components/UI/Toast'
import Copy from '@/components/Icon/set/Copy'
import Prev from '@/components/Icon/set/Prev'
import Next from '@/components/Icon/set/Next'
import { useCopyToClipboard } from 'usehooks-ts'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import type { InvitationCodeInfo } from '@/store/referrals'
import type { InviteType } from '@/api/referrals'

type ReferralFriendsListDialogProps = {
  info: InvitationCodeInfo
  onClose: () => void
  open: boolean
}

const PAGE_SIZE = 10

export const ReferralFriendsListDialog = ({
  info,
  open,
  onClose,
}: ReferralFriendsListDialogProps) => {
  const { getInvitationRelationships } = useReferralStore()
  const accessParams = useAccessParams()
  const [, copy] = useCopyToClipboard()

  const [list, setList] = useState<InviteType[]>([])
  const [loading, setLoading] = useState(false)
  const [before, setBefore] = useState<string | number | undefined>(undefined)
  const [after, setAfter] = useState<string | number | undefined>(undefined)
  const [hasNext, setHasNext] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (accessParams?.accessToken && accessParams.account) {
        const res = await getInvitationRelationships({
          code: info.invitationCode,
          after: after,
          before: before,
          limit: PAGE_SIZE,
        })
        setList(res ?? [])
        setLoading(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, before, after])

  const handlePrev = () => {
    if (list.length > 0) {
      setBefore(list[0].id)
      setAfter(undefined)
    }
  }

  const handleNext = () => {
    if (list.length > 0) {
      setAfter(list[list.length - 1].id)
      setBefore(undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ style: { background: '#202129', color: 'white' } }}
    >
      <DialogTitle className="border-b border-[#31333D]">
        <Trans>Friends List</Trans>
      </DialogTitle>
      <DialogContent>
        <div className="mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#31333D] text-[#CED1D9]">
                <th className="py-2 font-normal">
                  <Trans>Friends</Trans>
                </th>
                <th className="py-2 font-normal">
                  <Trans>Rebate</Trans>
                </th>
                <th className="py-2 text-right font-normal">
                  <Trans>Time</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-[#31333D]">
                      <td className="py-3">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="py-3">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="ml-auto h-5 w-32" />
                      </td>
                    </tr>
                  ))
                : list.map((row) => (
                    <tr key={row.id} className="hover:bg-[#31333D]">
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <span>{encryptionAddress(row.referee)}</span>
                          <Copy
                            size={16}
                            className="cursor-pointer"
                            onClick={() =>
                              copy(row.referee).then(
                                (rs) => rs && toast.success({ title: t`Copy success` }),
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3">{formatNumberPrecision(row.contribute, 2)} USDC</td>
                      <td className="py-3 text-right text-[#CED1D9]">
                        {dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-[#CED1D9]">
                    <Trans>No Data</Trans>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end gap-4">
            <div
              className={`cursor-pointer ${!after && !before ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
              onClick={() => {
                if (after || before) handlePrev()
              }}
            >
              <Prev size={12} />
            </div>
            <div
              className={`cursor-pointer ${!hasNext ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
              onClick={() => {
                if (hasNext) handleNext()
              }}
            >
              <Next size={12} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
