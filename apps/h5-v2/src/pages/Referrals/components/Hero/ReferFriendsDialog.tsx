import { useReferralStore } from '@/store/referrals'
import { msg, t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState, useRef } from 'react'
import { toast } from '@/components/UI/Toast'
import { useCopyToClipboard } from 'usehooks-ts'
import { QRCodeSVG } from 'qrcode.react'
import { encryptionAddress, openUrl } from '@/utils'
import LogoFull from '@/assets/images/logo-full.svg'
import ShareBanner from '@/assets/images/referrals/desktop/share_banner.png'
import { isUndefined } from 'lodash-es'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { InfoButton } from '@/components/UI/Button'
import { CloseIcon } from '@/components/Icon'
import { Copy } from '@/components/Copy'

import { i18n } from '@lingui/core'

import { LinkLockLine } from '@/components/Icon/set/LinkLockLine'
import { useThrottleFn } from 'ahooks'

import SVGXIcon from '@/assets/icon/commons/logo/x/36x36.svg'
import SVGTelegramIcon from '@/assets/icon/commons/logo/telegram/36x36.svg'
import { exportPngImage } from '@/utils/exportImage'

const FORMAT_VALUE_FALLBACK_LOCAL = '--'

const shareText = msg`Join MYX, Get fee discounts and up to 20% rebates.`

export const ReferFriendsDialog = () => {
  const { isReferFriendsDialogOpen, setReferFriendsDialogOpen, ratioInfo } = useReferralStore()
  const [, copy] = useCopyToClipboard()
  const [saving, setSaving] = useState(false)
  const downloadRef = useRef<HTMLDivElement>(null)

  const refRatio = ratioInfo

  const handleClose = () => setReferFriendsDialogOpen(false)

  const [saveing, setSaveing] = useState(false)
  const handleSaveShareImage = () => {
    setSaveing(true)

    exportPngImage(
      downloadRef.current as HTMLElement,
      `myx_refer_friends${refRatio?.invitationCode ? `_${refRatio?.invitationCode}` : ''}`,
      {
        pixelRatio: 3,
      },
    )
      .catch((err) => {
        toast(<Trans>保存失败</Trans>)
        console.error(err)
      })
      .finally(() => {
        setSaveing(false)
      })
  }

  const { run: copyFn } = useThrottleFn(
    (content: string) => {
      copy(content)
        .then((rs) => rs)
        .finally(() => {
          toast.success({
            title: t`Copy success`,
          })
        })
    },
    { wait: 1000 },
  )

  return (
    <DialogTheme
      open={isReferFriendsDialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '640px',
          background: '#202129',
          color: 'white',
          borderRadius: '16px',
        },
      }}
    >
      <div className="flex flex-col gap-8 p-8 lg:flex-row">
        <div className="hidden flex-col gap-5 lg:flex">
          <div
            ref={downloadRef}
            className="flex h-[385px] w-[270px] flex-col overflow-hidden rounded-xl bg-[#18191F]"
          >
            <div className="px-5 pt-5">
              <img src={LogoFull} className="h-[10px]" alt="logo" />
            </div>
            <div className="mx-auto mt-[14px] max-w-[200px] text-center text-xl leading-[1.2] font-bold text-white">
              <Trans>
                Join MYX And Enjoy <span className="text-[#FFD700]">20%</span> Commission
              </Trans>
            </div>
            <div>
              <img src={ShareBanner} className="h-[240px] w-[270px]" alt="banner" />
            </div>
            <div className="flex items-center justify-between bg-white px-5 py-[7px]">
              <div>
                <div className="text-xs leading-[1.2] font-bold text-[#1A1B23]">
                  <Trans>Referral ID:</Trans>{' '}
                  {refRatio?.invitationCode ?? FORMAT_VALUE_FALLBACK_LOCAL}
                </div>
                <div className="text-[10px] leading-[1.2] text-[#1A1B23]">
                  <Trans>Scan to Join MYX</Trans>
                </div>
              </div>
              {refRatio?.invitationLink && (
                <div className="rounded-[1px] border border-[#CED1D9] p-[1px]">
                  <QRCodeSVG value={refRatio.invitationLink} size={34} />
                </div>
              )}
            </div>
          </div>
          {refRatio?.invitationCode && (
            <InfoButton
              style={{
                height: '44px',
                borderRadius: '100px',
              }}
              className="w-full rounded-full"
              loading={saveing}
              onClick={handleSaveShareImage}
            >
              <Trans>Save as Picture</Trans>
            </InfoButton>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p>
                <Trans>Refer Friends</Trans>
              </p>
              <span onClick={handleClose} role="button">
                <CloseIcon size={16} />
              </span>
            </div>
            <div className="mt-[20px] flex justify-between gap-5 rounded-lg bg-[rgba(0,227,165,0.05)] p-3">
              <div>
                <div className="text-xs text-[#CED1D9]">
                  <Trans>You Receive</Trans>
                </div>
                <div className="mt-1 text-xl leading-none font-bold text-white">
                  {!isUndefined(refRatio?.referrerRatio)
                    ? `${refRatio?.referrerRatio}%`
                    : FORMAT_VALUE_FALLBACK_LOCAL}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#CED1D9]">
                  <Trans>Friends Receive</Trans>
                </div>
                <div className="mt-1 text-right text-xl leading-none font-bold text-white">
                  {!isUndefined(refRatio?.refereeRatio)
                    ? `${refRatio?.refereeRatio}%`
                    : FORMAT_VALUE_FALLBACK_LOCAL}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mt-[10px] flex flex-col gap-2">
              <div className="pl-3 text-xs leading-[1.5] font-medium text-[#CED1D9]">
                <Trans>Referral ID</Trans>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#18191F] p-3">
                <div className="text-xs leading-none font-medium text-[#CED1D9]">
                  {refRatio?.invitationCode ?? FORMAT_VALUE_FALLBACK_LOCAL}
                </div>
                {refRatio?.invitationCode && (
                  <Copy content={refRatio.invitationCode} className="cursor-pointer text-white" />
                )}
              </div>

              <div className="pl-3 text-xs leading-[1.5] font-medium text-[#CED1D9]">
                <Trans>Referral Link </Trans>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#18191F] p-3">
                <div className="text-xs leading-none font-medium text-[#CED1D9]">
                  {refRatio?.invitationLink
                    ? encryptionAddress(refRatio?.invitationLink, 10, 15)
                    : FORMAT_VALUE_FALLBACK_LOCAL}
                </div>
                {refRatio?.invitationLink && (
                  <Copy content={refRatio.invitationLink} className="cursor-pointer text-white" />
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              {/* copy link */}
              <div className="flex justify-between">
                <div
                  className="flex cursor-pointer flex-col items-center gap-1"
                  onClick={() => refRatio?.invitationLink && copyFn(refRatio.invitationLink)}
                  role="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#009970]">
                    {/* <span className="text-xs text-white">Link</span> */}
                    <LinkLockLine size={14} />
                  </div>
                  <div className="text-xs leading-[14px] text-[#CED1D9]">
                    <Trans>Copy Link</Trans>
                  </div>
                </div>
              </div>
              {/* x */}
              <div className="flex justify-between">
                <div
                  className="flex cursor-pointer flex-col items-center gap-1"
                  onClick={() =>
                    openUrl(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(i18n._(shareText))}&url=${encodeURIComponent(
                        refRatio?.invitationLink ?? '',
                      )}`,
                    )
                  }
                  role="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full">
                    {/* <span className="text-xs text-white">Link</span> */}
                    <img src={SVGXIcon} alt="x" className="h-full w-full" />
                  </div>
                  <div className="text-xs leading-[14px] text-[#CED1D9]">
                    <Trans>X</Trans>
                  </div>
                </div>
              </div>
              {/* telegram */}
              <div className="flex justify-between">
                <div
                  className="flex cursor-pointer flex-col items-center gap-1"
                  onClick={() =>
                    openUrl(
                      `https://t.me/share?url=${refRatio?.invitationLink}&text=${i18n._(shareText)}`,
                    )
                  }
                  role="button"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full">
                    {/* <span className="text-xs text-white">Link</span> */}
                    <img src={SVGTelegramIcon} alt="telegram" className="h-full w-full" />
                  </div>
                  <div className="text-xs leading-[14px] text-[#CED1D9]">
                    <Trans>X</Trans>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogTheme>
  )
}
