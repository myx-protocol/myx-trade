import { Trans } from '@lingui/react/macro'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { MYX_REFERRALS_RULES_LINK } from '@/config/link'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import ArrowRight from '@/components/Icon/set/ArrowRight'

export function HeroOverview() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()

  return (
    <div className="flex flex-col items-center px-4 lg:items-start lg:px-0">
      <div className="mt-10 max-w-[276px] text-center text-[32px] leading-[1.2] font-bold text-white lg:mt-auto lg:max-w-[413px] lg:text-left lg:text-[48px]">
        <Trans>
          Invite Friends Enjoy <span className="text-[#FFD700]">20%</span> Rebate
        </Trans>
      </div>

      <div className="mt-3 text-sm text-[20px] leading-[1.2] font-medium text-[#CED1D9]">
        <Trans>Share rebate with your friends</Trans>
      </div>

      <div className="text-center">
        {!isConnected && (
          <div className="mt-6 w-full max-w-[240px] lg:mt-10">
            <Button
              style={{
                width: '240px',
                borderRadius: '100px',
                height: '44px',
                fontSize: '14px',
                lineHeight: 1,
                fontWeight: 500,
                color: '#101114',
              }}
              onClick={() => setLoginModalOpen(true)}
            >
              <Trans>Connect Wallet</Trans>
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          <a
            href={MYX_REFERRALS_RULES_LINK}
            className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm leading-none text-[#CED1D9] hover:text-[#00E3A5] lg:mt-4"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>View referral rules</Trans>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
