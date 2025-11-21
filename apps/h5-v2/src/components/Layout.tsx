import { Outlet } from 'react-router-dom'
import { MyxSdkProvider } from '@/providers/MyxSdkProvider'
import { GlobalSearch } from './GlobalSearch/GlobalSearch'
import { useGlobalSearchStore } from './GlobalSearch/store'
import { Tabbar } from '@/components/Tabbar/index'
import { useLayout } from '@/hooks/layout/useLayout'
import { useEffect } from 'react'
function Layout() {
  const { isOpen } = useGlobalSearchStore()
  const { tabbarActiveItem } = useLayout()
  useEffect(() => {
    if (tabbarActiveItem) {
      document.documentElement.style.setProperty('--tabbar-height', '60px')
    } else {
      document.documentElement.style.setProperty('--tabbar-height', '0px')
    }
  }, [tabbarActiveItem])
  return (
    <div className="">
      <MyxSdkProvider>
        <div className="fixed bottom-0 left-0 z-20 h-[var(--tabbar-height)] w-full">
          {tabbarActiveItem && <Tabbar />}
        </div>
        <div className="flex min-h-screen flex-col pb-[var(--tabbar-height)]">
          {/* <Header /> */}
          {/* 主要内容区域 */}
          <Outlet />
          {/* {isShowFooter && <Footer />} */}
        </div>
        {/* global search modal */}
        {isOpen && <GlobalSearch />}
      </MyxSdkProvider>
    </div>
  )
}

export default Layout
