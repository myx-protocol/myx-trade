import { RouterProvider } from 'react-router-dom'
import router from './router'
import { CloseAllPositionDialog } from './pages/Trade/components/CloseAllPositionDialog'
import { usePositionStore } from './store/position/createStore'
import { useWalletStore } from './store/wallet/createStore'
import { LoginModal } from './components/Login/LoginModal'
import { MorePage } from './components/Login/MorePage'
import { Toaster } from './components/UI/Toast/Toaster'
import useGlobalStore from './store/globalStore'
import { UnlockAccountDialog } from './components/Seamless/UnlockAccountDialog'
import { SetPasswordDialog } from './components/Seamless/SetPasswordDialog'
import { ImportDialog } from './components/Seamless/ImportDialog'
import { ExportInfoDialog } from './components/Seamless/ExportInfoDialog'
import { ExportDialog } from './components/Seamless/ExportDialog'
import { useUpdateEffect } from 'ahooks'
import { CancelAllOrdersDialog } from './pages/Trade/components/CancelAllOrdersDialog'
import { useEffect } from 'react'
import { getPools } from './api'

function App() {
  const { closeAllPositionDialogOpen } = usePositionStore()
  const { loginModalOpen, moreLoginDrawerOpen } = useWalletStore()
  const {
    poolList,
    setPoolList,
    unlockAccountDialogOpen,
    seamlessPasswordDialogOpen,
    importSeamlessKeyDialogOpen,
    exportSeamlessInfoDialogOpen,
    exportSeamlessKeyDialogOpen,
    cancelAllOrdersDialogOpen,
  } = useGlobalStore()

  useUpdateEffect(() => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)

    const handleResize = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  useEffect(() => {
    getPools().then((res) => {
      const pools = res?.data ?? []
      setPoolList(pools)
    })
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      {closeAllPositionDialogOpen && <CloseAllPositionDialog />}
      {loginModalOpen && <LoginModal />}
      {moreLoginDrawerOpen && <MorePage />}
      {unlockAccountDialogOpen && <UnlockAccountDialog />}
      {seamlessPasswordDialogOpen && <SetPasswordDialog />}
      {importSeamlessKeyDialogOpen && <ImportDialog />}
      {exportSeamlessInfoDialogOpen && <ExportInfoDialog />}
      {exportSeamlessKeyDialogOpen && <ExportDialog />}
      {!!cancelAllOrdersDialogOpen && <CancelAllOrdersDialog />}
      <Toaster />
    </>
  )
}

export default App
