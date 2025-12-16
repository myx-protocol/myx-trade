import { RouterProvider } from 'react-router-dom'
import router from './router'

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
import { useEffect } from 'react'
import { getPools } from './api'

function App() {
  const { loginModalOpen, moreLoginDrawerOpen } = useWalletStore()
  const {
    poolList,
    setPoolList,
    unlockAccountDialogOpen,
    seamlessPasswordDialogOpen,
    importSeamlessKeyDialogOpen,
    exportSeamlessInfoDialogOpen,
    exportSeamlessKeyDialogOpen,
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
      {loginModalOpen && <LoginModal />}
      {moreLoginDrawerOpen && <MorePage />}
      {unlockAccountDialogOpen && <UnlockAccountDialog />}
      {seamlessPasswordDialogOpen && <SetPasswordDialog />}
      {importSeamlessKeyDialogOpen && <ImportDialog />}
      {exportSeamlessInfoDialogOpen && <ExportInfoDialog />}
      {exportSeamlessKeyDialogOpen && <ExportDialog />}
      <Toaster />
    </>
  )
}

export default App
