import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const ignoreFooterPaths = ['/cook', 'trade']

export const useLayout = () => {
  const location = useLocation()

  const isShowFooter = useMemo(() => {
    return !ignoreFooterPaths.some((path) => location.pathname.includes(path))
  }, [location.pathname])

  return {
    isShowFooter,
  }
}
