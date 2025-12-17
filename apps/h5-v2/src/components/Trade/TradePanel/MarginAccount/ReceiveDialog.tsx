import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'

import { useTradePageStore } from '../../store/TradePageStore'

import { useTradePanelStore } from '../store'
import { ReceiveDialog as ReceiveDialogComponent } from '@/components/ReceiveDialog'

export const ReceiveDialog = () => {
  const { address } = useWalletConnection()
  const { symbolInfo } = useTradePageStore()
  const { receiveDialogOpen, setReceiveDialogOpen } = useTradePanelStore()

  return (
    <ReceiveDialogComponent
      address={address as string}
      chainId={symbolInfo?.chainId as number}
      open={receiveDialogOpen}
      onClose={() => setReceiveDialogOpen(false)}
      symbol={symbolInfo?.quoteSymbol as string}
    />
  )
}
