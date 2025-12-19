import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { Trans, t } from '@lingui/macro'
import { toast } from '@/components/UI/Toast'
import Copy from '@/components/Icon/set/Copy'
import { useCopyToClipboard } from 'usehooks-ts'
import { encryptionAddress } from '@/utils'
import { isNil, isUndefined } from 'lodash-es'

const FORMAT_VALUE_FALLBACK = '--'

export const RefererDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { referrerInfo, configData } = useReferralStore()
  const [, copy] = useCopyToClipboard()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ style: { background: '#202129', color: 'white' } }}
    >
      <DialogTitle className="border-b border-[#31333D]">
        <Trans>My Referrer</Trans>
      </DialogTitle>
      <DialogContent>
        <div className="flex justify-between py-4 text-sm text-[#CED1D9]">
          <div>
            <Trans>My referrer</Trans>
          </div>
          <div className="flex items-center gap-1 text-white">
            <span>{encryptionAddress(referrerInfo?.referrer) || FORMAT_VALUE_FALLBACK}</span>
            {referrerInfo?.referrer && (
              <Copy
                size={16}
                className="cursor-pointer"
                onClick={() =>
                  copy(referrerInfo.referrer).then(
                    (rs) => rs && toast.success({ title: t`Copy success` }),
                  )
                }
              />
            )}
          </div>
        </div>

        <div className="h-[1px] bg-[#31333D]" />

        <div className="flex justify-between py-4 text-sm text-[#CED1D9]">
          <div>
            <Trans>Invitee Rebate Rate</Trans>
          </div>
          <div className="flex items-center gap-1 text-white">
            {!isNil(referrerInfo) ? `${referrerInfo.refereeRatio}%` : FORMAT_VALUE_FALLBACK}
          </div>
        </div>

        <div className="h-[1px] bg-[#31333D]" />

        {!isUndefined(configData?.maxVipLevel) && (
          <div className="mt-3 text-xs text-[#CED1D9]">
            <Trans>VIP {configData?.maxVipLevel} or above are not eligible for rebates</Trans>
          </div>
        )}

        <div className="mt-5">
          <Button className="w-full" onClick={onClose}>
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
