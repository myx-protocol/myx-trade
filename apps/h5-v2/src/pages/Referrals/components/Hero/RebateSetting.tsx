import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Skeleton } from '@/components/UI/Skeleton'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import { PrimaryButton as Button } from '@/components/UI/Button'
import TipsFill from '@/components/Icon/set/TipsFill'
import { useReferralStore } from '@/store/referrals'
import { isUndefined } from 'lodash-es'
import { useNavigate } from 'react-router-dom'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { encryptionAddress } from '@/utils'
import { ReferFriendsDialog } from './ReferFriendsDialog'
import { SelectReferralDialog } from './SelectReferralDialog'
import { useEffect } from 'react'
import { Tooltips } from '@/components/UI/Tooltips'
import { Copy } from '@/components/Copy'

const FORMAT_VALUE_FALLBACK = '--'

export function RebateSetting() {
  const { ratioInfo, fetchRatioInfo, isLoadingRatio, accessToken } = useReferralStore()

  useEffect(() => {
    if (accessToken) {
      fetchRatioInfo()
    }
  }, [accessToken, fetchRatioInfo])

  const refRatio = ratioInfo

  return (
    <div className="flex justify-center px-4 pt-10 lg:px-0 lg:pt-0">
      <div className="w-full min-w-full rounded-2xl border border-[#31333D] bg-[rgba(32,33,41,0.80)] p-5 backdrop-blur-[20px] lg:min-w-[420px]">
        <div className="flex justify-between gap-5 text-xs leading-[14px] text-[#CED1D9]">
          <div>
            <Trans>Default Referral</Trans>
          </div>
          <Configure />
        </div>

        <div className="mt-3 flex justify-between gap-5 rounded-lg bg-[rgba(0,227,165,0.05)] p-4">
          <div>
            <div className="flex items-center gap-0.5 text-xs text-[rgba(255,255,255,0.60)]">
              <Trans>You Receive</Trans>
              <Tooltips title={t`The commission rate you can earn after your friend trades.`}>
                <TipsFill size={16} className="text-[16px]" />
              </Tooltips>
            </div>
            <div className="mt-1 text-xl leading-none font-bold text-[#CED1D9]">
              {isLoadingRatio ? (
                <Skeleton className="h-5 w-12" />
              ) : !isUndefined(refRatio?.referrerRatio) ? (
                `${refRatio?.referrerRatio}%`
              ) : (
                FORMAT_VALUE_FALLBACK
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-0.5 text-xs text-[rgba(255,255,255,0.60)]">
              <Trans>Friends Receive</Trans>
              <Tooltips title={t`The refund rate you can earn after your friend trades.`}>
                <TipsFill size={16} className="text-[16px]" />
              </Tooltips>
            </div>
            <div className="mt-1 text-right text-xl leading-none font-bold text-[#CED1D9]">
              {isLoadingRatio ? (
                <Skeleton className="ml-auto h-5 w-12" />
              ) : !isUndefined(refRatio?.refereeRatio) ? (
                `${refRatio?.refereeRatio}%`
              ) : (
                FORMAT_VALUE_FALLBACK
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[rgba(24,25,31,0.80)] text-xs leading-[14px] text-white">
          <div className="flex items-center justify-between gap-5 p-4">
            <div>
              <Trans>Referral ID</Trans>
            </div>
            <div className="flex items-center gap-1">
              {isLoadingRatio ? (
                <Skeleton className="h-[14px] w-20" />
              ) : (
                <>
                  <span>{refRatio?.invitationCode ?? FORMAT_VALUE_FALLBACK}</span>
                  {refRatio?.invitationCode && (
                    <Copy
                      content={refRatio.invitationCode!}
                      className="cursor-pointer text-[16px]"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#31333D]" />

          <div className="flex items-center justify-between gap-5 p-4">
            <div>
              <Trans>Referral Link</Trans>
            </div>
            <div className="flex items-center gap-1">
              {isLoadingRatio ? (
                <Skeleton className="h-[14px] w-32" />
              ) : (
                <>
                  <span>
                    {refRatio?.invitationLink
                      ? encryptionAddress(refRatio?.invitationLink, 10, 15)
                      : FORMAT_VALUE_FALLBACK}
                  </span>
                  {refRatio?.invitationLink && (
                    <Copy
                      content={refRatio.invitationLink!}
                      className="cursor-pointer text-[16px]"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <InviteButton />
        </div>
      </div>
    </div>
  )
}

function InviteButton() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const { setReferFriendsDialogOpen } = useReferralStore()

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Button
          className="w-full rounded-full"
          style={{
            height: '44px',
            borderRadius: '100px',
          }}
          onClick={() => {
            if (!isConnected) {
              setLoginModalOpen(true)
              return
            }
            setReferFriendsDialogOpen(true)
          }}
        >
          <Trans>Invite Friends</Trans>
        </Button>
        <ReferFriendsDialog />
      </div>
    </div>
  )
}

function Configure() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const navigate = useNavigate()
  const { setSelectReferralDialogOpen } = useReferralStore()

  return (
    <>
      <div
        className="flex cursor-pointer items-center text-[#00E3A5] hover:opacity-70"
        onClick={() => {
          if (!isConnected) {
            setLoginModalOpen(true)
            return
          }
          if (window.innerWidth >= 1024) {
            setSelectReferralDialogOpen(true)
          } else {
            navigate('/referrals/select-referral')
          }
        }}
      >
        <Trans>Change referral settings</Trans>
        <ArrowRight size={16} />
      </div>
      <SelectReferralDialog />
    </>
  )
}
