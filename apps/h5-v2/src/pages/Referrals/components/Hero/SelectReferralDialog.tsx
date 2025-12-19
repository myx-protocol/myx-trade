// import { Dialog, DialogContent } from '@mui/material'
import { useReferralStore, InvitationCodeFlag } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useState, useEffect, type MouseEventHandler } from 'react'
import EditSimply from '@/components/Icon/set/EditSimply'
import UsersLine from '@/components/Icon/set/UsersLine'
import { formatNumberPercent } from '@/utils/formatNumber'
import { RebateSettingDialog } from '../SelectReferral/RebateSettingDialog'
import { EditNoteDialog } from '../SelectReferral/EditNoteDialog'
import { SetDefaultConfirmDialog } from '../SelectReferral/SetDefaultConfirmDialog'
import { ReferralFriendsListDialog } from '../SelectReferral/ReferralFriendsListDialog'
import type { InvitationCodeInfo } from '@/store/referrals'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { Copy } from '@/components/Copy'
import { Loading } from '../Loading'
import { Empty } from '@/components/Empty'
import { ReferralsEmpty } from '../Empty'
import { useCopyToClipboard } from 'usehooks-ts'
import { useThrottleFn } from 'ahooks'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const SelectReferralDialog = () => {
  const {
    isSelectReferralDialogOpen,
    setSelectReferralDialogOpen,
    fetchInvitationCodes,
    invitationCodes,
    accessToken,
    isLoadingCodes,
  } = useReferralStore()

  const [addOpen, setAddOpen] = useState(false)
  const [editNoteInfo, setEditNoteInfo] = useState<InvitationCodeInfo | null>(null)
  const [setDefaultInfo, setSetDefaultInfo] = useState<InvitationCodeInfo | null>(null)
  const [friendsListInfo, setFriendsListInfo] = useState<InvitationCodeInfo | null>(null)

  useEffect(() => {
    if (isSelectReferralDialogOpen && accessToken) {
      fetchInvitationCodes()
    }
  }, [isSelectReferralDialogOpen, accessToken, fetchInvitationCodes])

  const handleClose = () => setSelectReferralDialogOpen(false)

  const [, copy] = useCopyToClipboard()

  const { run: onCopyFn } = useThrottleFn(
    (text: string) => {
      copy(text)
        .then((rs) => rs)
        .finally(() => {
          toast.success({
            title: t`Copy success`,
          })
        })
    },
    { wait: 1000 },
  )
  const onCopy = (content: string) => {
    if (content) {
      onCopyFn(content)
    }
  }

  return (
    <DialogTheme
      open={isSelectReferralDialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '800px',
          background: '#202129',
          color: 'white',
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitleTheme onClose={handleClose} divider>
        <div className="text-lg font-bold">
          <Trans>Select Referral</Trans>
        </div>
      </DialogTitleTheme>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] leading-none">
              <Trans>Remaining number of promotional links to be created: {9}</Trans>
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            + <Trans>Add New Referral</Trans>
          </Button>
        </div>

        <div className="min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#31333D] text-[#CED1D9]">
                <th className="px-3 py-2 font-normal">
                  <Trans>Referral ID</Trans>
                </th>
                <th className="px-3 py-2 font-normal">
                  <Trans>My Rebate</Trans>
                </th>
                <th className="px-3 py-2 font-normal">
                  <Trans>Friends Rebate</Trans>
                </th>
                <th className="px-3 py-2 font-normal">
                  <Trans>Friends</Trans>
                </th>
                <th className="px-3 py-2 font-normal">
                  <Trans>Note</Trans>
                </th>
                <th className="px-3 py-2 text-right font-normal">
                  <Trans>Action</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {Boolean(!isLoadingCodes && !invitationCodes.length) && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="h-[150px]">
                      <ReferralsEmpty />
                    </div>
                  </td>
                </tr>
              )}
              {isLoadingCodes ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="h-[150px]">
                      <Loading />
                    </div>
                  </td>
                </tr>
              ) : (
                invitationCodes?.map((row) => (
                  <tr key={row.invitationCode} className="hover:bg-[#31333D]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span>{row.invitationCode}</span>
                        <Copy content={row.invitationCode} className="cursor-pointer" />
                      </div>
                    </td>
                    <td className="px-3 py-3">{formatNumberPercent(row.referrerRatio, 0)}</td>
                    <td className="px-3 py-3">{formatNumberPercent(row.refereeRatio, 0)}</td>
                    <td className="px-3 py-3">
                      <div
                        className="flex cursor-pointer items-center gap-1 hover:text-[#00E3A5]"
                        onClick={() => setFriendsListInfo(row)}
                      >
                        <UsersLine size={16} />
                        <span>{row.referees ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span>{row.note || '--'}</span>
                        <EditSimply
                          size={16}
                          className="cursor-pointer hover:text-[#00E3A5]"
                          onClick={() => setEditNoteInfo(row)}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-[24px]">
                        {/* copy */}
                        <p
                          role="button"
                          className="text-green"
                          onClick={() => onCopy(row.invitationLink)}
                        >
                          <Trans>Copy Link</Trans>
                        </p>
                        {row.flag === InvitationCodeFlag.DEFAULT && (
                          <span className="rounded bg-[rgba(0,227,165,0.1)] px-1 text-xs text-[#00E3A5]">
                            <Trans>Default</Trans>
                          </span>
                        )}
                        {row.flag !== InvitationCodeFlag.DEFAULT && (
                          <span
                            className="text-green cursor-pointer hover:underline"
                            onClick={() => setSetDefaultInfo(row)}
                          >
                            <Trans>Set as Default</Trans>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RebateSettingDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {editNoteInfo && (
        <EditNoteDialog
          open={!!editNoteInfo}
          info={editNoteInfo}
          onClose={() => setEditNoteInfo(null)}
        />
      )}

      {setDefaultInfo && (
        <SetDefaultConfirmDialog
          open={!!setDefaultInfo}
          info={setDefaultInfo}
          onClose={() => setSetDefaultInfo(null)}
        />
      )}

      {friendsListInfo && (
        <ReferralFriendsListDialog
          open={!!friendsListInfo}
          info={friendsListInfo}
          onClose={() => setFriendsListInfo(null)}
        />
      )}
    </DialogTheme>
  )
}
