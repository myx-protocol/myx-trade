import { DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { toast } from '@/components/UI/Toast'
import { z } from 'zod'
import type { InvitationCodeInfo } from '@/store/referrals'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'

type EditNoteDialogProps = { info: InvitationCodeInfo; open: boolean; onClose: () => void }

export const EditNoteDialog = ({ info, open, onClose }: EditNoteDialogProps) => {
  const { updateInvitationNote, fetchInvitationCodes, accessToken } = useReferralStore()
  const [confirming, setConfirming] = useState(false)
  const [note, setNote] = useState('')

  const handleConfirm = async () => {
    try {
      setConfirming(true)
      if (accessToken) {
        await updateInvitationNote(info.invitationCode, note)
        await fetchInvitationCodes()
        onClose()
        toast.success({ title: t`Updated successfully` })
      }
    } catch (e: any) {
      toast.error({ title: e.message || 'Error' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <DialogTheme
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ style: { background: '#202129', color: 'white' } }}
    >
      <DialogTitleTheme divider onClose={onClose}>
        <Trans>Edit Note</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="mt-4">
          <div className="text-sm font-medium text-white">
            <Trans>Note</Trans>
          </div>
          <div className="mt-2 rounded border border-[#31333D] hover:border-[#00E3A5]">
            <input
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              defaultValue={info.note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={20}
              placeholder={t`Enter 1-20 character`}
              autoFocus
            />
          </div>
        </div>

        <div className="mt-8">
          <Button
            style={{
              height: '44px',
            }}
            className="w-full"
            loading={confirming}
            disabled={!note}
            onClick={handleConfirm}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
