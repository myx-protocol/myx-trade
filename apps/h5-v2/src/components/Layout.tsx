import { Outlet } from 'react-router-dom'
import { MyxSdkProvider } from '@/providers/MyxSdkProvider'
import { GlobalSearch } from './GlobalSearch/GlobalSearch'
import { useGlobalSearchStore } from './GlobalSearch/store'
import { Tabbar } from '@/components/Tabbar/index'
import { useLayout } from '@/hooks/layout/useLayout'
import { useEffect, useRef } from 'react'
import { AccountDialog } from './AccountDialog'
import useGlobalStore from '@/store/globalStore'
import { VipRedeemDialog } from './VipRedeemDialog'
import { VipRedeemResultDialog } from './VipRedeemDialog/VipRedeemResultDialog'

import { UnlockAccountDialog } from '@/components/Seamless/UnlockAccountDialog'
import { SetPasswordDialog } from '@/components/Seamless/SetPasswordDialog'
import { ImportDialog } from '@/components/Seamless/ImportDialog'
import { ExportInfoDialog } from '@/components/Seamless/ExportInfoDialog'
import { ExportDialog } from '@/components/Seamless/ExportDialog'
import { TradeMode } from '@/pages/Trade/types'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { SelectAccountDialog } from './Seamless/SelectAccountDialog'
import { ResetSetPasswordDialog } from './Seamless/ResetSetPasswordDialog'

function Layout() {
  const { isOpen } = useGlobalSearchStore()
  const { tabbarActiveItem } = useLayout()
  const { accountDialogOpen, vipRedeemDialogOpen, vipRedeemResultDialogOpen } = useGlobalStore()
  const { address } = useWalletConnection()
  const { activeSeamlessAddress } = useSeamlessStore()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (tabbarActiveItem) {
      document.documentElement.style.setProperty('--tabbar-height', '60px')
    } else {
      document.documentElement.style.setProperty('--tabbar-height', '0px')
    }
  }, [tabbarActiveItem])

  const {
    unlockAccountDialogOpen,
    seamlessPasswordDialogOpen,
    importSeamlessKeyDialogOpen,
    exportSeamlessInfoDialogOpen,
    exportSeamlessKeyDialogOpen,
    tradeMode,
    setUnlockAccountDialogOpen,
    selectedSeamlessAccountDialogOpen,
    resetSeamlessPasswordDialogOpen,
  } = useGlobalStore()

  useEffect(() => {
    // 只在 Seamless 模式下处理
    if (tradeMode === TradeMode.Seamless && address !== activeSeamlessAddress) {
      setUnlockAccountDialogOpen(true)
    }
  }, [tradeMode, activeSeamlessAddress, address, setUnlockAccountDialogOpen])

  useEffect(() => {
    if (tradeMode === TradeMode.Seamless) {
      setUnlockAccountDialogOpen(true)
      isFirstRender.current = false
    }
  }, [tradeMode, setUnlockAccountDialogOpen])

  return (
    <div>
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
        {accountDialogOpen && <AccountDialog />}
        {vipRedeemDialogOpen && <VipRedeemDialog />}
        {vipRedeemResultDialogOpen && <VipRedeemResultDialog />}
        {unlockAccountDialogOpen && <UnlockAccountDialog />}
        {seamlessPasswordDialogOpen && <SetPasswordDialog />}
        {resetSeamlessPasswordDialogOpen && <ResetSetPasswordDialog />}
        {importSeamlessKeyDialogOpen && <ImportDialog />}
        {exportSeamlessInfoDialogOpen && <ExportInfoDialog />}
        {exportSeamlessKeyDialogOpen && <ExportDialog />}
        {selectedSeamlessAccountDialogOpen && <SelectAccountDialog />}
      </MyxSdkProvider>
    </div>
  )
}

export default Layout
