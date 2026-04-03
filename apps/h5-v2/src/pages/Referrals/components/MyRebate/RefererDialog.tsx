import { DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { toast } from '@/components/UI/Toast'
import Copy from '@/components/Icon/set/Copy'
import { useCopyToClipboard } from 'usehooks-ts'
import { encryptionAddress } from '@/utils'
import { isNil, isUndefined } from 'lodash-es'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { DialogBase } from '@/components/UI/DialogBase'
import { Drawer } from '@/components/Drawer'

const FORMAT_VALUE_FALLBACK = '--'

export const RefererDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { referrerInfo, configData } = useReferralStore()
  const [, copy] = useCopyToClipboard()

  return (
    <DialogBase
      open={open}
      onClose={onClose}
      title={null}
      sx={{
        '.MuiDrawer-paper': {
          padding: '0px',
        },
      }}
    >
      <DialogTitleTheme divider onClose={onClose} className="px-[24px]!">
        <Trans>My Referrer</Trans>
      </DialogTitleTheme>
      <div className="px-[24px]">
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
          <PrimaryButton
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '9999px',
            }}
            className="w-full"
            onClick={onClose}
          >
            <Trans>Confirm</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
