import MenuSwap from '@/assets/home/swap.png'
import MenuEarn from '@/assets/home/earn.png'
import MenuReferral from '@/assets/home/referral.png'
import MenuVip from '@/assets/home/vip.png'
import MenuDate from '@/assets/home/date.png'
import { Trans } from '@lingui/react/macro'

interface MenuItem {
  icon: string
  title: () => React.ReactNode
  href?: string
}

export const EXPRESS_MENU_LIST: MenuItem[] = [
  {
    title: () => <Trans>Swap</Trans>,
    icon: MenuSwap,
  },
  {
    title: () => <Trans>Earn</Trans>,
    icon: MenuEarn,
    href: '/earn',
  },
  {
    title: () => <Trans>Referral</Trans>,
    icon: MenuReferral,
  },
  {
    title: () => <Trans>VIP</Trans>,
    icon: MenuVip,
  },
  {
    title: () => <Trans>Date</Trans>,
    icon: MenuDate,
  },
]
