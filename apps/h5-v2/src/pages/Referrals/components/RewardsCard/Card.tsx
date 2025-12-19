import { Trans } from '@lingui/macro'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import RebateDesktop from '@/assets/images/referrals/desktop/rebate.png'
import InviteDesktop from '@/assets/images/referrals/desktop/invite.png'
import IncomeDesktop from '@/assets/images/referrals/desktop/income.png'
import RebateMobile from '@/assets/images/referrals/mobile/rebate.png'
import InviteMobile from '@/assets/images/referrals/mobile/invite.png'
import IncomeMobile from '@/assets/images/referrals/mobile/income.png'
import { useMediaQuery } from 'usehooks-ts'

export function RebateCard() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const handleInvite = () => {
    if (!isConnected) {
      setLoginModalOpen(true)
      return
    }
    const element = document.getElementById('referral-hero')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      className="h-full rounded-2xl border border-[#31333D] bg-cover bg-no-repeat px-4 py-5 lg:px-8 lg:py-10"
      style={{
        backgroundImage: `url(${isDesktop ? RebateDesktop : RebateMobile})`,
      }}
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="max-w-[163px] leading-[1.3] font-bold text-[#FFF7E5] capitalize lg:max-w-[320px] lg:text-[32px]">
            <Trans>Invite friends to enjoy high rebate</Trans>
          </div>

          <div className="mt-3 flex items-start gap-3 lg:mt-6">
            <div>
              <div className="text-[24px] leading-none font-bold text-[#FFD700] lg:text-[32px]">
                20%
              </div>
              <div className="mt-1.5 text-xs leading-none text-[rgba(255,255,255,0.38)] lg:text-lg">
                <Trans>Rebate</Trans>
              </div>
            </div>
            <div>
              <svg
                className="h-7 w-7 text-[#FFD700] lg:h-8 lg:w-8"
                viewBox="0 0 33 33"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.9991 17V5H13.9991V17H2V21H13.9991V33H17.9991V21H30V17H17.9991Z"
                />
              </svg>
            </div>
            <div>
              <div className="text-[24px] leading-none font-bold text-[#FFD700] lg:text-[32px]">
                10%
              </div>
              <div className="mt-1.5 text-xs leading-none text-[rgba(255,255,255,0.38)] lg:text-lg">
                <Trans>Return</Trans>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[24px] flex">
          <div
            className="inline-flex cursor-pointer items-center gap-1 text-[#00E3A5] hover:opacity-70"
            onClick={handleInvite}
          >
            <span className="text-[22px] leading-none font-medium">
              <Trans>Invite Now</Trans>
            </span>
            <ArrowRight size={24} className="lg:text-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const IncomeCard = ({ className }: { className?: string }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div
      className={`flex items-center rounded-2xl border border-[#31333D] bg-cover bg-no-repeat px-4 py-8 lg:px-6 ${className || ''}`}
      style={{
        backgroundImage: `url(${isDesktop ? IncomeDesktop : IncomeMobile})`,
      }}
    >
      <div className="max-w-[230px] leading-normal font-medium text-[#FFF7E5] lg:max-w-[350px] lg:text-xl">
        <Trans>
          Bind the invitation relationship and get up to <span className="text-[#FFD700]">10%</span>{' '}
          of the income
        </Trans>
      </div>
    </div>
  )
}

export const InviteCard = ({ className }: { className?: string }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div
      className={`rounded-2xl border border-[#31333D] bg-cover bg-no-repeat px-4 py-8 lg:px-8 ${className || ''}`}
      style={{
        backgroundImage: `url(${isDesktop ? InviteDesktop : InviteMobile})`,
      }}
    >
      <div className="leading-none font-bold text-[#FFF7E5] lg:text-xl">
        <Trans>Invite friends to join MYX</Trans>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <div className="text-[24px] leading-none font-bold text-[#FFD700] lg:text-[40px]">20%</div>

        <div className="pb-1 text-xs leading-none text-[rgba(255,255,255,0.38)] lg:text-lg">
          <Trans>Rebate up to</Trans>
        </div>
      </div>
    </div>
  )
}
