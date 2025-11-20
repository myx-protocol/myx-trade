import { Outlet } from 'react-router-dom'
import { MyxSdkProvider } from '@/providers/MyxSdkProvider'
import { GlobalSearch } from './GlobalSearch/GlobalSearch'
import { useGlobalSearchStore } from './GlobalSearch/store'
import { Tabbar } from '@/components/Tabbar/index'
import { useLayout } from '@/hooks/layout/useLayout'
function Layout() {
  const { isOpen } = useGlobalSearchStore()
  const { tabbarActiveItem } = useLayout()
  return (
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
  )
}

export default Layout
