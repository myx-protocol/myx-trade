import MenuEarn from '@/assets/home/earn.png'
import MenuReferral from '@/assets/home/referral.png'
import MenuVip from '@/assets/home/vip.png'
import MenuDate from '@/assets/home/date.png'
import MenuCook from '@/assets/home/cook.png'

import { Trans } from '@lingui/react/macro'

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
    title: () => <Trans>Data</Trans>,
    icon: MenuDate,
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
