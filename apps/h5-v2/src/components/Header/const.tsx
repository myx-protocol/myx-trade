import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'
import IconRockets from '@/assets/svg/header/rockets.svg?react'
import { SearchTypeEnum } from '@myx-trade/sdk'

type MenuItem = {
  href?: string
  label: ReactNode
  searchType?: SearchTypeEnum
}

export const MENU_LIST: Array<MenuItem> = [
  {
    href: '/trade',
    label: <Trans>Trade</Trans>,
    searchType: SearchTypeEnum.Contract,
  },
  {
    href: '/earn',
    label: <Trans>Earn</Trans>,
    searchType: SearchTypeEnum.Earn,
  },
  {
    href: '/cook',
    label: <Trans>Cook</Trans>,
    searchType: SearchTypeEnum.Cook,
  },
  {
    href: '/market',
    label: (
      <div className="flex items-center gap-[4px]">
        <IconRockets className="h-[16px] w-[16px]" />
        <Trans>Create Market</Trans>
      </div>
    ),
  },
] as const
