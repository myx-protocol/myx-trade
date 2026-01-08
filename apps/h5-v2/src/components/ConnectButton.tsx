import { TradeButton } from '@/components/Button/TradeButton.tsx'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import type { ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'

export const ConnectButton = ({ children }: { children: ReactNode }) => {
  const { address: account, isConnected, setLoginModalOpen } = useWalletConnection()
  if (account && isConnected) return children
  return (
    <TradeButton variant="contained" className={'w-full'} onClick={() => setLoginModalOpen(true)}>
      <Trans>Connect Wallet</Trans>
    </TradeButton>
  )
}
