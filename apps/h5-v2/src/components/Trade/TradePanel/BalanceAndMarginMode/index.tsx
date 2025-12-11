import { formatNumberWithBaseToken } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import Reverse from '@/components/Icon/set/ReverseV2'
import { ArrowDown } from '@/components/Icon'
import { useTradePanelStore } from '../store'
import clsx from 'clsx'
import { useTradePageStore } from '../../store/TradePageStore'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'

const Balance = () => {
  const { symbolInfo } = useTradePageStore()
  const { setReceiveDialogOpen } = useTradePanelStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

  const { checkWalletChainId } = useWalletChainCheck()

  const onReceive = () => {
    if (!symbolInfo?.chainId) return
    checkWalletChainId(symbolInfo.chainId).then(() => {
      setReceiveDialogOpen(true)
    })
  }

  return (
    <div className="flex min-w-0 flex-[1_1_0%] items-center gap-[4px] text-[12px] leading-[1] font-medium">
      <p className="flex-shrink-0 text-[#848E9C]">
        <Trans>Balance</Trans>
      </p>
      <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-white">
        {formatNumberWithBaseToken(accountAssets?.availableMargin?.toString() ?? '0', {
          showUnit: false,
        })}
      </p>
      <div className="flex flex-shrink-0 cursor-pointer" onClick={onReceive}>
        <Reverse size={14} color="#00E3A5" />
      </div>
    </div>
  )
}

const MarginMode = () => {
  const { autoMarginMode, setAutoMarginMode } = useTradePanelStore()

  return (
    <div
      className="flex items-center text-[12px] leading-[1] font-medium"
      role="button"
      onClick={() => {
        console.log('autoMarginMode-->', autoMarginMode)
        setAutoMarginMode(!autoMarginMode)
      }}
    >
      <p className="text-white">
        {autoMarginMode ? <Trans>Auto Margin</Trans> : <Trans>Manual Margin</Trans>}
      </p>
      <div className="ml-[4px] flex">
        <span
          className={clsx('inline-flex', {
            'rotate-180': !autoMarginMode,
          })}
        >
          <ArrowDown size={12} color="#fff" />
        </span>
      </div>
    </div>
  )
}

export const BalanceAndMarginMode = () => {
  return (
    <div className="mt-[8px] flex justify-between gap-[24px]">
      <Balance />
      <MarginMode />
    </div>
  )
}
