import { MENU_LIST } from './const'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'

export const Menu = () => {
  const { pathname } = useLocation()
  return (
    <div className="flex items-center gap-[40px] text-[16px] leading-[16px] font-medium text-white">
      {MENU_LIST.map((item) => {
        const isActive = item.href ? pathname.startsWith(item.href) : false
        return (
          <Link key={item.href} to={item.href ?? ''} className={clsx(isActive && 'text-green')}>
            <Trans>{item.label}</Trans>
          </Link>
        )
      })}
    </div>
  )
}
