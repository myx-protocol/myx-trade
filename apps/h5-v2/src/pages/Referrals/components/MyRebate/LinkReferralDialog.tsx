import { DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { toast } from '@/components/UI/Toast'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'

export const LinkReferralDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { bindRelationshipByCode, fetchRefReferrerInfo, accessToken } = useReferralStore()
  const [confirming, setConfirming] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')

  const handleConfirm = async () => {
    if (!invitationCode) return
    setConfirming(true)
    try {
      if (accessToken) {
        const res = await bindRelationshipByCode(invitationCode)
        if (res?.code !== 9200) {
          toast.error({ title: res?.msg || 'Error' })
          return
        }
        await fetchRefReferrerInfo()
        onClose()
        toast.success({ title: t`Bound successfully` })
      }
    } catch (e: any) {
      console.error(e)
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
        <Trans>Accept Invitation</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="mt-4">
          <div className="text-sm font-medium text-white">
            <Trans>Referral ID</Trans>
          </div>
          <div className="mt-2 rounded border border-[#31333D] hover:border-[#00E3A5]">
            <input
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              maxLength={7}
              placeholder={t`Please enter the Referral ID`}
              autoFocus
            />
          </div>
          <div className="mt-[16px] text-xs text-[#6d7180]">
            <Trans>Once accepted, referral relationship cannot be changed</Trans>
          </div>
        </div>

        <div className="mt-5">
          <Button
            style={{
              height: '44px',
            }}
            className="w-full"
            loading={confirming}
            disabled={!invitationCode}
            onClick={handleConfirm}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
