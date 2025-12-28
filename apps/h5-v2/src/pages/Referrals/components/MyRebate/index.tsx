import { Trans } from '@lingui/react/macro'
import { useReferralStore } from '@/store/referrals'
import { formatNumberPrecision } from '@/utils/formatNumber'
import { ModuleTitle } from '../ModuleTitle'
import { RebateClaim } from './RebateClaim'
import { RefererDialog } from './RefererDialog'
import { LinkReferralDialog } from './LinkReferralDialog'
import { Tooltip } from '@mui/material'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useEffect, useState } from 'react'
import { isUndefined } from 'lodash-es'
import { getChainInfo } from '@/config/chainInfo'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'

const COMMON_USD_ASSETS_SCALE = 2
const FORMAT_VALUE_FALLBACK = '--'

export function MyRebate() {
  const {
    bonusInfo,
    bonusChainInfo,
    referrerInfo,
    fetchRefBonus,
    fetchRefBonusInfoByChain,
    fetchRefReferrerInfo,
    isLoadingBonus,
    isLoadingChainBonus,
    isLoadingReferrer,
    accessToken,
  } = useReferralStore()

  const { address } = useWalletConnection()

  useEffect(() => {
    if (accessToken) {
      fetchRefBonus()
      fetchRefBonusInfoByChain()
      fetchRefReferrerInfo()
    }
  }, [accessToken, fetchRefBonus, fetchRefBonusInfoByChain, fetchRefReferrerInfo, address])

  return (
    <>
      <div className="lg:hidden">
        <MyRebateMobile
          bonus={bonusInfo}
          chainInfo={bonusChainInfo}
          referrerInfo={referrerInfo}
          loading={isLoadingBonus || isLoadingChainBonus || isLoadingReferrer}
        />
      </div>
      <div className="hidden lg:block">
        <MyRebateDesktop
          bonus={bonusInfo}
          chainInfo={bonusChainInfo}
          referrerInfo={referrerInfo}
          loading={isLoadingBonus || isLoadingChainBonus || isLoadingReferrer}
        />
      </div>
    </>
  )
}

function MyRebateMobile({ bonus, chainInfo, referrerInfo, loading }: any) {
  return (
    <div className="flex flex-col">
      <ModuleTitle
        className="py-5"
        more={
          <>
            {isUndefined(referrerInfo) ? null : referrerInfo?.referrer ? (
              <Referrer />
            ) : (
              <LinkReferral />
            )}
          </>
        }
      >
        <Trans>My Rebate</Trans>
      </ModuleTitle>

      <div className="mt-3 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs leading-none text-[#CED1D9]">
              <Trans>Unclaimed</Trans>
            </div>
            <Tooltip title={<UnclaimedList infos={chainInfo} />} placement="bottom" arrow>
              <div className="mt-1.5 flex cursor-help gap-1 text-[28px] leading-none font-bold text-[#FFD700] underline decoration-dashed decoration-1 underline-offset-4">
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  formatNumberPrecision(bonus?.availableAmount, COMMON_USD_ASSETS_SCALE)
                )}
              </div>
            </Tooltip>
          </div>
          <div>
            <RebateClaim />
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <div className="text-xs leading-none text-[#CED1D9]">
              <Trans>Claimed</Trans>
            </div>
            <div className="mt-1.5 flex gap-1 text-[28px] leading-none font-bold text-white">
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                formatNumberPrecision(bonus?.claimedAmount, COMMON_USD_ASSETS_SCALE)
              )}
            </div>
          </div>
          <div>
            <div className="text-xs leading-none text-[#CED1D9]">
              <Trans>Invited Friends</Trans>
            </div>
            <div className="mt-1.5 flex justify-end gap-1 text-[28px] leading-none font-bold text-white">
              {loading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                (bonus?.referees ?? FORMAT_VALUE_FALLBACK)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="my-6 h-[1px] bg-[#31333D]" />

      <div className="flex flex-col gap-5 leading-none">
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <Tooltips
              title={t`Inviting others to register and receiving rewards as the inviter after the invitees trade.`}
              arrow
            >
              <span className="cursor-help border-b border-dashed border-[#CED1D9]">
                <Trans>Referrer Rebate</Trans>
              </span>
            </Tooltips>
            <span className="text-xs font-bold text-white">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                `${formatNumberPrecision(bonus?.bonus, COMMON_USD_ASSETS_SCALE)}`
              )}
            </span>
          </div>

          {referrerInfo?.referrer && (
            <div className="flex items-center gap-1">
              <Tooltips
                title={t`The cashback income for the invitee's contract transaction fees.`}
                arrow
              >
                <span className="cursor-help border-b border-dashed border-[#CED1D9]">
                  <Trans>Invitee Rebate</Trans>
                </span>
              </Tooltips>
              <span className="text-xs font-bold text-white">
                {loading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  `${formatNumberPrecision(bonus?.rebates, COMMON_USD_ASSETS_SCALE)} `
                )}
              </span>
            </div>
          )}
        </div>

        {referrerInfo?.referrer && (
          <div className="flex">
            <div className="flex items-center gap-1">
              <Tooltips
                title={t`The cashback ratio for the invitee's contract transaction fees.`}
                arrow
              >
                <span className="cursor-help border-b border-dashed border-[#CED1D9]">
                  <Trans>Invitee Rebate Rate</Trans>
                </span>
              </Tooltips>
              <span className="text-xs font-bold text-white">
                {loading ? (
                  <Skeleton className="h-4 w-10" />
                ) : !isUndefined(referrerInfo?.refereeRatio) ? (
                  `${referrerInfo.refereeRatio}%`
                ) : (
                  FORMAT_VALUE_FALLBACK
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MyRebateDesktop({ bonus, chainInfo, referrerInfo, loading }: any) {
  return (
    <div className="flex flex-col">
      <ModuleTitle
        className="py-5"
        more={
          <>
            {isUndefined(referrerInfo) ? null : referrerInfo?.referrer ? (
              <Referrer />
            ) : (
              <LinkReferral />
            )}
          </>
        }
      >
        <Trans>My Rebate</Trans>
      </ModuleTitle>

      <div className="mt-7 flex justify-between gap-6">
        <div className="flex-1">
          <div className="text-lg leading-none text-[#CED1D9]">
            <Trans>Unclaimed</Trans>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {/* <Tooltips title={<UnclaimedList infos={chainInfo} />} placement="right" arrow> */}
            <div className="cursor-help text-[40px] leading-none font-bold text-[#FFD700] decoration-1">
              {loading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                formatNumberPrecision(bonus?.availableAmount, COMMON_USD_ASSETS_SCALE)
              )}
            </div>
            {/* </Tooltips> */}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-lg leading-none text-[#CED1D9]">
            <Trans>Claimed</Trans>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <div className="text-[40px] leading-none font-bold text-white">
              {loading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                formatNumberPrecision(bonus?.claimedAmount, COMMON_USD_ASSETS_SCALE)
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-lg leading-none text-[#CED1D9]">
            <Trans>Invited Friends</Trans>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <div className="text-[40px] leading-none font-bold text-white">
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                (bonus?.referees ?? FORMAT_VALUE_FALLBACK)
              )}
            </div>
          </div>
        </div>

        <div>
          <RebateClaim />
        </div>
      </div>

      <div className="my-7 h-[1px] bg-[#31333D]" />

      <div className="flex">
        <div className="flex items-center gap-1">
          <Tooltips
            title={t`Inviting others to register and receiving rewards as the inviter after the invitees trade.`}
            arrow
          >
            <span className="cursor-help border-b border-dashed border-[#848E9C] leading-none text-[#848E9C]">
              <Trans>Referrer Rebate</Trans>
            </span>
          </Tooltips>
          <span className="text-xl leading-none font-bold text-white">
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              `${formatNumberPrecision(bonus?.bonus, COMMON_USD_ASSETS_SCALE)}`
            )}
          </span>
        </div>

        {referrerInfo?.referrer && (
          <div className="flex flex-1">
            <div className="ml-[90px] flex items-center gap-1">
              <Tooltips
                title={t`The cashback income for the invitee's contract transaction fees.`}
                arrow
              >
                <span className="cursor-help border-b border-dashed border-[#848E9C] leading-none text-[#848E9C]">
                  <Trans>Invitee Rebate</Trans>
                </span>
              </Tooltips>
              <span className="text-xl leading-none font-bold text-white">
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  `${formatNumberPrecision(bonus?.rebates, COMMON_USD_ASSETS_SCALE)} `
                )}
              </span>
            </div>

            <div className="mx-[90px] h-5 w-[1px] bg-[#31333D]" />

            <div className="flex items-center gap-1">
              <Tooltips
                title={t`The cashback ratio for the invitee's contract transaction fees.`}
                arrow
              >
                <span className="cursor-help border-b border-dashed border-[#848E9C] leading-none text-[#848E9C]">
                  <Trans>Invitee Rebate Rate</Trans>
                </span>
              </Tooltips>
              <span className="text-xl leading-none font-bold text-white">
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : !isUndefined(referrerInfo?.refereeRatio) ? (
                  `${referrerInfo.refereeRatio}%`
                ) : (
                  FORMAT_VALUE_FALLBACK
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UnclaimedList({ infos }: { infos?: any[] }) {
  if (!infos) return null
  return (
    <div className="flex flex-col">
      {infos.map((item, index) => (
        <div key={item.chainId}>
          <div className="flex justify-between gap-6 p-4 text-sm leading-none font-medium">
            <div>{getChainInfo(item.chainId)?.label}</div>
            <div>{formatNumberPrecision(item.availableAmount, COMMON_USD_ASSETS_SCALE)} </div>
          </div>
          {index < infos.length - 1 && <div className="h-[1px] bg-[#31333D]" />}
        </div>
      ))}
    </div>
  )
}

function Referrer() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="flex cursor-pointer items-center leading-none font-medium text-white hover:text-[#00E3A5] lg:text-sm"
        onClick={() => {
          if (!isConnected) {
            setLoginModalOpen(true)
            return
          }
          setOpen(true)
        }}
      >
        <Trans>View my referrer</Trans>
        <ArrowRight size={16} />
      </div>
      <RefererDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function LinkReferral() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="flex cursor-pointer items-center leading-none font-medium text-white hover:text-[#00E3A5] lg:text-sm"
        onClick={() => {
          if (!isConnected) {
            setLoginModalOpen(true)
            return
          }
          setOpen(true)
        }}
      >
        <Trans>Link Referral Relationship</Trans>
        <ArrowRight size={16} />
      </div>
      <LinkReferralDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
