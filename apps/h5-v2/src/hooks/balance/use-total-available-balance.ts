import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useGetAccountPoolAssets } from './use-get-account-pool-Assets'
import { useGetWalletBalance } from './use-get-wallet-balance'
import { parseBigNumber } from '@/utils/bn'
import { useMemo } from 'react'

export const useTotalAvailableBalance = () => {
  const { symbolInfo } = useTradePageStore()
  const accountPoolAssets = useGetAccountPoolAssets(symbolInfo?.poolId as string)
  const walletBalance = useGetWalletBalance()

  const totalBalance = useMemo(() => {
    const freeAmount = accountPoolAssets?.freeAmount
    const tradeableProfit = accountPoolAssets?.tradeableProfit

    const total = parseBigNumber(walletBalance.toString())
      .plus(parseBigNumber(freeAmount.toString()))
      .plus(parseBigNumber(tradeableProfit.toString()))
      .toString()
    return total
  }, [walletBalance, accountPoolAssets, symbolInfo?.quoteDecimals])

  return totalBalance
}
