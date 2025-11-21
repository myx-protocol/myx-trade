import BannerPng from '@/assets/home/banner.png'
import { PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'

export const Banner = () => {
  return (
    <div className="w-full">
      <img className="w-full" src={BannerPng} />
      <div className="px-[16px]">
        <p className="text-[24px] leading-[1.2] font-medium">
          <Trans>The New Species of Perpetual DEX</Trans>
        </p>
        <PrimaryButton
          style={{
            marginTop: '24px',
            width: '100%',
            height: '44px',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '1',
            color: '#fff',
          }}
        >
          <Trans>Get Started</Trans>
        </PrimaryButton>
      </div>
    </div>
  )
}
