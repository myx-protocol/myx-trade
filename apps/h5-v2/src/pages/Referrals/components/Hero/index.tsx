import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import hero_referral_bg from '@/assets/images/referrals/desktop/hero_referral_bg.png'
import hero_referral_banner from '@/assets/images/referrals/desktop/hero_referral_banner.png'
import hero_banner_bg from '@/assets/images/referrals/desktop/hero_banner_bg.png'
import mobile_hero_referral_banner from '@/assets/images/referrals/mobile/hero_referral_banner.png'
import mobile_hero_referral_bg from '@/assets/images/referrals/mobile/hero_referral_bg.png'
import { RebateSetting } from './RebateSetting'
import { RebateRewardScroll } from './RebateRewardScroll'
import { HeroOverview } from './Overview'

export function Hero() {
  return (
    <>
      <div className="hidden w-full lg:block">
        <HeroDesktop />
      </div>
      <div className="block w-full lg:hidden">
        <HeroMobile />
      </div>
    </>
  )
}

function HeroMobile() {
  const { isConnected } = useWalletConnection()
  const bannerUrl = mobile_hero_referral_bg

  return (
    <div className="w-full">
      <div
        className="w-full"
        style={
          isConnected
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundPosition: 'center bottom',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'auto 340px',
              }
            : {}
        }
      >
        <HeroOverview />
        <div className="mx-auto max-w-[500px]">
          {isConnected ? <RebateSetting /> : <img src={mobile_hero_referral_banner} alt="banner" />}
        </div>
      </div>
      <div className="mt-5">
        <RebateRewardScroll />
      </div>
    </div>
  )
}

function HeroDesktop() {
  const { isConnected } = useWalletConnection()
  const bannerUrl = hero_referral_bg

  return (
    <div
      className="w-full"
      style={
        !isConnected
          ? {
              backgroundImage: `url(${hero_banner_bg})`,
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      <div className="mx-auto lg:max-w-[1196px]">
        <div
          className="flex min-h-[400px] items-center py-10"
          style={
            !isConnected
              ? {
                  backgroundImage: `url(${hero_referral_banner})`,
                  backgroundPosition: 'right center',
                  backgroundRepeat: 'no-repeat',
                }
              : {}
          }
        >
          <div>
            <HeroOverview />
          </div>
          {isConnected && (
            <div
              className="flex flex-1 justify-end"
              style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundPosition: 'right 34px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '568px 312px',
              }}
            >
              <div className="max-w-max">
                <RebateSetting />
              </div>
            </div>
          )}
        </div>
        <div className="mt-5">
          <RebateRewardScroll />
        </div>
      </div>
    </div>
  )
}
