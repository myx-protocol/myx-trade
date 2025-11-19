import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import Reverse from '@/components/Icon/set/ReverseV2'
import { ArrowDown } from '@/components/Icon'
import { useTradePanelStore } from '../store'
import clsx from 'clsx'
import { useGetWalletBalance } from '@/hooks/balance/use-get-wallet-balance'
import { useTradePageStore } from '../../store/TradePageStore'
import { ethers } from 'ethers'
import { useGetAccountPoolAssets } from '@/hooks/balance/use-get-account-pool-Assets'
import { useMemo } from 'react'
import { parseBigNumber } from '@/utils/bn'

const Balance = () => {
  const { symbolInfo } = useTradePageStore()
  const tokenBalanceString = useGetWalletBalance()
  const walletBalance =
    ethers.formatUnits(tokenBalanceString, symbolInfo?.quoteDecimals ?? 6) ?? '0'
  const accountPoolAssets = useGetAccountPoolAssets(symbolInfo?.poolId as string)

  const totalBalance = useMemo(() => {
    const freeAmount =
      ethers.formatUnits(accountPoolAssets?.freeAmount ?? '0', symbolInfo?.quoteDecimals ?? 6) ??
      '0'

    return parseBigNumber(walletBalance ?? 0)
      .plus(parseBigNumber(freeAmount))
      .toString()
  }, [walletBalance, accountPoolAssets, symbolInfo?.quoteDecimals])

  return (
    <div className="flex min-w-0 flex-[1_1_0%] items-center gap-[4px] text-[12px] leading-[1] font-medium">
      <p className="flex-shrink-0 text-[#848E9C]">
        <Trans>Balance</Trans>
      </p>
      <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white">
        {formatNumber(totalBalance, {
          decimals: 2,
          showUnit: false,
        })}
      </p>
      <div className="flex flex-shrink-0">
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
      onClick={() => setAutoMarginMode(!autoMarginMode)}
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
