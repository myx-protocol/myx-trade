import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useMemo } from 'react'
import { TAB_LIST } from './const'

export const Tabbar = () => {
  const { pathname } = useLocation()
  const activePath = useMemo(() => {
    const item = TAB_LIST.find((item) => {
      if (item.path === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(item.path)
    })
    return item?.path || '/'
  }, [pathname])
  return (
    <div className="border-base/50 z-50 flex h-full w-full items-end justify-between border-t-[1px] bg-[#101114] px-[20px] py-[13px] text-[10px] leading-[1] font-medium text-[#848E9C]">
      {TAB_LIST.filter((item) => !item.hidden).map((item) => {
        return (
          <Link to={item.path} key={item.path}>
            <div
              className={clsx('flex min-w-[42px] flex-col items-center', {
                'gap-[6px]': !item.isBubble,
                'gap-[1px]': item.isBubble,
                'text-green': activePath === item.path,
              })}
            >
              {item.isBubble && (
                <div
                  className={clsx(
                    'box-content flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[999px] border-[5px] border-[#101114] text-[#101114]',
                    {
                      'bg-green': activePath === item.path,
                      'bg-[#848E9C]': activePath !== item.path,
                    },
                  )}
                >
                  {item.icon}
                </div>
              )}
              {!item.isBubble && item.icon}
              <p>{item.label()}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
