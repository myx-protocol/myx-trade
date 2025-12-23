import { t } from '@lingui/core/macro'
import MXIcon from '@/components/Icon/set/MX'
import EarnIcon from '@/components/Icon/set/Earn'
import MarketsIcon from '@/components/Icon/set/Markets'
import TabbarCookIcon from '@/components/Icon/set/TabbarCook'
import TradeIcon from '@/components/Icon/set/Trade'

interface TabItem {
  label: () => React.ReactNode
  path: string
  icon: React.ReactNode
  isBubble?: boolean
  hidden?: boolean
}

export const TAB_LIST: TabItem[] = [
  {
    label: () => t`Home`,
    path: '/',
    icon: <MXIcon size={18} />,
    hidden: false,
  },
  {
    label: () => t`Markets`,
    path: '/market-list',
    icon: <MarketsIcon size={18} />,
    hidden: false,
  },
  {
    label: () => t`Trade`,
    path: '/trade',
    icon: <TradeIcon size={18} />,
    isBubble: true,
    hidden: false,
  },
  {
    label: () => t`Cook`,
    path: '/cook',
    icon: <TabbarCookIcon size={18} />,
    hidden: false,
  },
  {
    label: () => t`Earn`,
    path: '/earn',
    icon: <EarnIcon size={18} />,
    hidden: false,
  },
  {
    label: () => t`VIP`,
    path: '/vip',
    icon: <EarnIcon size={18} />,
    hidden: true,
  },
]
