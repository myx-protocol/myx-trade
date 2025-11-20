import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { TAB_LIST } from '@/components/Tabbar/const'

export const useLayout = () => {
  const { pathname } = useLocation()
  /**
   * actived tabbar item
   */
  const tabbarActiveItem = useMemo(() => {
    const item = TAB_LIST.find((item) => {
      if (item.path === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(item.path)
    })
    return item
  }, [pathname])

  return {
    tabbarActiveItem,
  }
}
