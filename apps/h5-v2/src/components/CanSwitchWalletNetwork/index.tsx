import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { DangerButton, PrimaryButton } from '../UI/Button'
import { Trans } from '@lingui/react/macro'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useWallet } from '@/hooks/wallet/useWallet'
import { useWalletStore } from '@/store/wallet/createStore'

interface CanSwitchWalletNetworkProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  targetChainId?: number
}
export const CanSwitchWalletNetwork = ({
  children,
  className,
  style,
  targetChainId,
}: CanSwitchWalletNetworkProps) => {
  const { isWrongNetwork, isWalletConnected } = useWalletConnection()
  const { checkWalletChainId } = useWalletChainCheck()
  const { setLoginModalOpen } = useWalletStore()

  if (!isWalletConnected) {
    return (
      <PrimaryButton
        style={{
          width: '100%',
          height: '100%',
          fontSize: '13px',
          color: 'white',
          fontWeight: 'bold',
          lineHeight: 1,
          minHeight: '44px',
          ...style,
        }}
        className={className}
        onClick={() => {
          setLoginModalOpen(true)
        }}
      >
        <Trans>Connect Wallet</Trans>
      </PrimaryButton>
    )
  }

  if (isWrongNetwork && isWalletConnected) {
    return (
      <DangerButton
        onClick={() => {
          checkWalletChainId(targetChainId)
        }}
        style={{
          width: '100%',
          height: '100%',
          fontSize: '13px',
          color: 'white',
          fontWeight: 'bold',
          lineHeight: 1,
          minHeight: '44px',
          ...style,
        }}
        className={className}
      >
        <Trans>Switch Network</Trans>
      </DangerButton>
    )
  }

  return children
}
