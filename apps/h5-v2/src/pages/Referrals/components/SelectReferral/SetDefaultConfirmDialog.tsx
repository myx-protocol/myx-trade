import { DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { toast } from '@/components/UI/Toast'
import WarningLine from '@/components/Icon/set/WarningLine'
import type { InvitationCodeInfo } from '@/store/referrals'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'

type SetDefaultConfirmDialogProps = {
  info: InvitationCodeInfo
  onClose: () => void
  open: boolean
}

export const SetDefaultConfirmDialog = ({ info, open, onClose }: SetDefaultConfirmDialogProps) => {
  const { setDefaultInvitationCode, fetchInvitationCodes, fetchRatioInfo, accessToken } =
    useReferralStore()
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    try {
      setConfirming(true)
      if (accessToken) {
        await setDefaultInvitationCode(info.invitationCode)
        await Promise.all([fetchInvitationCodes(), fetchRatioInfo()])
        onClose()
        toast.success({ title: t`Set successfully` })
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
        <Trans>Set as Default</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="flex flex-col items-center py-5">
          <div className="mb-5 text-[#848E9C]">
            <WarningLine size={48} />
          </div>
          <div className="text-center text-sm leading-[1.5] text-white">
            <Trans>
              After setting {info.invitationCode} as the Default Referral ID, the corresponding
              commission ratio and referral link will be displayed on the homepage. Are you sure you
              want to set this as your Default Referral ID?
            </Trans>
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          <Button
            className="flex-1"
            style={{
              height: '44px',
            }}
            loading={confirming}
            onClick={handleConfirm}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
