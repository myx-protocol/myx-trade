import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'
import { Trans } from '@lingui/react/macro'
import { useState, useEffect } from 'react'
import { toast } from '@/components/UI/Toast'
import { Copy } from '@/components/Copy'
import Prev from '@/components/Icon/set/Prev'
import Next from '@/components/Icon/set/Next'
import { useCopyToClipboard } from 'usehooks-ts'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import type { InvitationCodeInfo } from '@/store/referrals'
import type { GetUserReferralDataParams, InviteType, UserReferralDataType } from '@/api/referrals'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { t } from '@lingui/core/macro'
import { ReferralsEmpty } from '../Empty'
import { formatNumber } from '@/utils/number'

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

  const [list, setList] = useState<UserReferralDataType[]>([])
  const [loading, setLoading] = useState(false)
  const [before, setBefore] = useState<string | number | undefined>(0)
  const [after, setAfter] = useState<string | number | undefined>(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (accessParams?.accessToken && accessParams.account) {
        const params: GetUserReferralDataParams = {
          code: info.invitationCode,
          limit: PAGE_SIZE,
          after: after,
          before: before,
        }

        const res = await getInvitationRelationships(params)

        const hasNoMoreData = res.length < PAGE_SIZE

        let hasPrevPage = true
        let hasNextPage = true
        if (!params.after && !params.before) {
          hasPrevPage = false
          if (hasNoMoreData) {
            hasNextPage = false
          }
        } else if (params.after && hasNoMoreData) {
          hasNextPage = false
        } else if (params.before && hasNoMoreData) {
          hasPrevPage = false
        }
        setList(res ?? [])
        setHasNext(hasNextPage)
        setHasPrev(hasPrevPage)
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, before, after, accessParams?.accessToken, accessParams?.account])

  const handlePrev = () => {
    if (list.length > 0) {
      setBefore(list[0].id)
      setAfter(0)
    }
  }

  const handleNext = () => {
    if (list.length > 0) {
      setAfter(list[list.length - 1].id)
      setBefore(0)
    }
  }

  return (
    <DialogTheme
      open={open}
      onClose={onClose}
      sx={{
        '.MuiPaper-root': {
          minWidth: '600px',
        },
      }}
    >
      <DialogTitleTheme divider onClose={onClose}>
        <Trans>Friends List</Trans>
      </DialogTitleTheme>
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
                          <Copy content={row.referee} />
                        </div>
                      </td>
                      <td className="py-3">{formatNumber(row.contribute)} USDC</td>
                      <td className="py-3 text-right text-[#CED1D9]">
                        {dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-[#CED1D9]">
                    <div className="h-[150px]">
                      <ReferralsEmpty />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end gap-4">
            <div
              className={`cursor-pointer ${!hasPrev ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
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
    </DialogTheme>
  )
}
