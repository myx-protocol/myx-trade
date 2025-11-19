import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useLayout } from '@/hooks/layout/useLayout'
import { MyxSdkProvider } from '@/providers/MyxSdkProvider'
import { GlobalSearch } from './GlobalSearch/GlobalSearch'
import { useGlobalSearchStore } from './GlobalSearch/store'
function Layout() {
  const { isShowFooter } = useLayout()
  const { isOpen } = useGlobalSearchStore()
  return (
    <MyxSdkProvider>
      <div className="mx-auto flex min-h-screen min-w-[1200px] flex-col">
        <Header />
        {/* 主要内容区域 */}
        <Outlet />
        {isShowFooter && <Footer />}
      </div>
      {/* global search modal */}
      {isOpen && <GlobalSearch />}
    </MyxSdkProvider>
  )
}

export default Layout
