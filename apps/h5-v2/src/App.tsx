import { RouterProvider } from 'react-router-dom'
import router from './router'
import { CloseAllPositionDialog } from './pages/Trade/components/CloseAllPositionDialog'
import { usePositionStore } from './store/position/createStore'
import { useWalletStore } from './store/wallet/createStore'
import { LoginModal } from './components/Login/LoginModal'
import { MorePage } from './components/Login/MorePage'
import { Toaster } from './components/UI/Toast/Toaster'
import useGlobalStore from './store/globalStore'
import { ChangeModeDialog } from './components/ChangeModeDialog'
import { UnlockAccountDialog } from './components/Seamless/UnlockAccountDialog'
import { SetPasswordDialog } from './components/Seamless/SetPasswordDialog'
import { ImportDialog } from './components/Seamless/ImportDialog'
import { ExportInfoDialog } from './components/Seamless/ExportInfoDialog'
import { ExportDialog } from './components/Seamless/ExportDialog'

function App() {
  const { closeAllPositionDialogOpen } = usePositionStore()
  const { loginModalOpen, moreLoginDrawerOpen } = useWalletStore()
  const { changeModeDialogOpen } = useGlobalStore()
  const {
    unlockAccountDialogOpen,
    seamlessPasswordDialogOpen,
    importSeamlessKeyDialogOpen,
    exportSeamlessInfoDialogOpen,
    exportSeamlessKeyDialogOpen,
  } = useGlobalStore()
  return (
    <>
      <RouterProvider router={router} />
      {closeAllPositionDialogOpen && <CloseAllPositionDialog />}
      {loginModalOpen && <LoginModal />}
      {moreLoginDrawerOpen && <MorePage />}
      {changeModeDialogOpen && <ChangeModeDialog />}
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
