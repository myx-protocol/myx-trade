import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { memo, useState } from 'react'
import { Trans, t } from '@lingui/macro'
import { Box, Stack, Divider, DialogContent } from '@mui/material'
import { DialogSuspense, SuspenseLoading } from '@/components/Loading'
import CopyLine from '@/components/Icon/set/Copy'
import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from '@/components/UI/Toast'
import NextPage from '@/components/Icon/set/Next'
import LastPage from '@/components/Icon/set/Prev'
import { TableNoData as NoData } from '@/pages/Trade/components/TableNoData'
import { encryptionAddress } from '@/utils'
import { formatNumberPrecision } from '@/utils/formatNumber'
import dayjs from 'dayjs'
import type { InviteType as inviteType } from '@/api/referrals'
import type { InvitationCodeInfo } from '@/store/referrals'
import { useQuery } from '@tanstack/react-query'
import { listInvites } from '@/api/referrals'
import { useReferralStore } from '@/store/referrals'

const timestamp2Time = (ts: number) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss')

const COMMON_USD_ASSETS_LABEL = 'USDC'
const COMMON_USD_ASSETS_SCALE = 2

type ReferralFriendsListMobileDialogProps = {
  info: InvitationCodeInfo
  onClose: () => void
  open: boolean
}

const ReferralFriendsListMobileDialogComp = memo((props: ReferralFriendsListMobileDialogProps) => {
  const { open, onClose } = props

  return (
    <DialogTheme
      onClose={onClose}
      open={open}
      sx={{
        '.MuiPaper-root': {
          maxWidth: '360px',
        },
      }}
    >
      <DialogTitleTheme divider onClose={onClose}>
        <Trans>Friends List</Trans>
      </DialogTitleTheme>

      <DialogSuspense>
        <ReferralFriendsListMobileDialogContent {...props} />
      </DialogSuspense>
    </DialogTheme>
  )
})

ReferralFriendsListMobileDialogComp.displayName = 'ReferralFriendsListMobileDialogComp'

export const ReferralFriendsListMobileDialog = Object.assign(
  ReferralFriendsListMobileDialogComp,
  {},
)

const pageSize = 3
function ReferralFriendsListMobileDialogContent(props: ReferralFriendsListMobileDialogProps) {
  const [, copy] = useCopyToClipboard()
  const { accessToken, account } = useReferralStore()

  const [before, setBefore] = useState<inviteType['id'] | undefined>(undefined)
  const [after, setAfter] = useState<inviteType['id'] | undefined>(undefined)

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['listInvites', accessToken, account, props.info.invitationCode, before, after],
    queryFn: async () => {
      if (!accessToken || !account) return { data: [], hasNextPage: false, hasPrevPage: false }
      // Fetch one more item to check if there is a next page
      const limit = pageSize + 1
      const res = await listInvites(
        { code: props.info.invitationCode, after, before, limit },
        { accessToken, account },
      )

      // Assuming res is the array of items based on api/referrals.ts definition
      // If it's ApiResponse, we might need res.data. But listInvites type says InviteType[].
      // Let's assume it returns the array directly or we handle it.
      // If listInvites returns ApiResponse<InviteType[]>, then we need res.data.
      // But let's look at api/referrals.ts again.
      // It returns http.get<InviteType[]>.
      // Usually http.get unwraps data.
      const data = Array.isArray(res) ? res : (res as any).data || []

      let hasNextPage = false
      let hasPrevPage = false

      if (data.length > pageSize) {
        if (!before) {
          hasNextPage = true
        } else {
          hasPrevPage = true
          // If we fetched backwards (before), and got more than limit, it means there are more previous items?
          // Actually, cursor pagination usually works by fetching limit+1.
          // If we have before, we are going backwards.
          // If we have after, we are going forwards.
        }
      }

      // Simplified pagination logic for now, just slicing
      const slicedData = data.slice(0, pageSize)

      // Re-implementing the logic from the atom:
      // const hasNoMoreData = rs.data.length < paginatedLimit
      // if (!query.after && !query.before) { hasPrevPage = false; if (hasNoMoreData) hasNextPage = false }
      // else if (query.after && hasNoMoreData) hasNextPage = false
      // else if (query.before && hasNoMoreData) hasPrevPage = false

      const hasNoMoreData = data.length < limit

      if (!after && !before) {
        hasPrevPage = false
        if (hasNoMoreData) hasNextPage = false
        else hasNextPage = true
      } else if (after) {
        hasPrevPage = true // We came from somewhere
        if (hasNoMoreData) hasNextPage = false
        else hasNextPage = true
      } else if (before) {
        hasNextPage = true // We came from somewhere
        if (hasNoMoreData) hasPrevPage = false
        else hasPrevPage = true
      }

      return { data: slicedData, hasNextPage, hasPrevPage }
    },
  })

  const { data: invitationRelationships = [], hasNextPage, hasPrevPage } = pageData || {}

  return (
    <DialogContent>
      <Stack direction="column">
        {isLoading ? (
          <Box minHeight="200px">
            <SuspenseLoading />
          </Box>
        ) : invitationRelationships.length === 0 ? (
          <Stack height="300px" alignItems="center" justifyContent="center">
            <NoData />
          </Stack>
        ) : (
          invitationRelationships.map((info: inviteType, index: number) => {
            return (
              <Box key={info.id}>
                <Stack direction="column" gap="20px">
                  <Stack direction="row" justifyContent="space-between" gap="10px">
                    <Box>
                      <Stack
                        direction="row"
                        gap="4px"
                        alignItems="center"
                        color="white"
                        fontSize="12px"
                        lineHeight="14px"
                        fontWeight="500"
                      >
                        {encryptionAddress(info.referee)}

                        <Box
                          component="span"
                          sx={{ cursor: 'pointer', display: 'flex' }}
                          onClick={() => {
                            copy(info.referee).then(
                              (rs) => rs && toast.success({ title: t`Copy success` }),
                            )
                          }}
                        >
                          <CopyLine
                            size={14}
                            style={{ width: '14px', height: '14px', color: 'white' }}
                          />
                        </Box>
                      </Stack>

                      <Box mt="6px" color="text.secondary" fontSize="12px" lineHeight={1}>
                        <Trans>Friends</Trans>
                      </Box>
                    </Box>

                    <Box textAlign="right">
                      <Box fontSize="12px" lineHeight="14px" fontWeight="500" color="white">
                        {formatNumberPrecision(info.contribute, COMMON_USD_ASSETS_SCALE)}{' '}
                        {COMMON_USD_ASSETS_LABEL}
                      </Box>
                      <Box mt="6px" color="text.secondary" fontSize="12px" lineHeight={1}>
                        <Trans>Rebate</Trans>
                      </Box>
                    </Box>
                  </Stack>

                  <Stack>
                    <Box>
                      <Box fontSize="12px" color="text.primary">
                        {timestamp2Time(info.createTime)}
                      </Box>
                      <Box mt="6px" color="text.secondary" fontSize="12px" lineHeight={1}>
                        <Trans>Time</Trans>
                      </Box>
                    </Box>
                  </Stack>
                </Stack>

                {index !== invitationRelationships.length - 1 && <Divider sx={{ my: '16px' }} />}
              </Box>
            )
          })
        )}
      </Stack>

      {(hasPrevPage || hasNextPage) && (
        <Box
          display="flex"
          mt="17px"
          alignItems="center"
          justifyContent="flex-end"
          columnGap="32px"
          p="0 20px"
        >
          <Box
            component="span"
            sx={{
              color: isLoading || !hasPrevPage ? 'text.disabled' : 'text.primary',
              cursor: isLoading || !hasPrevPage ? 'not-allowed' : 'pointer',
              display: 'flex',
            }}
            onClick={() => {
              if (isLoading || !hasPrevPage) return

              setBefore(() => invitationRelationships?.[0]?.id)
              setAfter(() => undefined)
            }}
          >
            <LastPage size={14} style={{ width: '14px', height: '12px' }} />
          </Box>
          <Box
            component="span"
            sx={{
              color: isLoading || !hasNextPage ? 'text.disabled' : 'text.primary',
              cursor: isLoading || !hasNextPage ? 'not-allowed' : 'pointer',
              display: 'flex',
            }}
            onClick={() => {
              if (isLoading || !hasNextPage) return

              setBefore(() => undefined)
              setAfter(() => invitationRelationships?.[invitationRelationships?.length - 1]?.id)
            }}
          >
            <NextPage size={14} style={{ width: '14px', height: '12px' }} />
          </Box>
        </Box>
      )}
    </DialogContent>
  )
}
