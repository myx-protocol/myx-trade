import MenuEarn from '@/assets/home/earn.png'
import MenuReferral from '@/assets/home/referral.png'
import MenuVip from '@/assets/home/vip.png'
import MenuCook from '@/assets/home/cook.png'
import MenuTrench from '@/assets/home/trench.png'

import { Trans } from '@lingui/react/macro'
import { EarnTabType } from '@/pages/Earn/components/type'

interface MenuItem {
  icon: string
  title: () => React.ReactNode
  href?: string
}

export const EXPRESS_MENU_LIST: MenuItem[] = [
  {
    title: () => <Trans>Referrals</Trans>,
    icon: MenuReferral,
    href: '/referrals',
  },
  {
    title: () => <Trans>VIP</Trans>,
    icon: MenuVip,
    href: '/vip',
  },
  {
    title: () => <Trans>Trench</Trans>,
    icon: MenuTrench,
    href: `/earn?type=${EarnTabType.Trench}`,
  },
  {
    title: () => <Trans>Cook</Trans>,
    icon: MenuCook,
    href: '/cook',
  },
  {
    title: () => <Trans>Earn</Trans>,
    icon: MenuEarn,
    href: '/earn',
  },
]
