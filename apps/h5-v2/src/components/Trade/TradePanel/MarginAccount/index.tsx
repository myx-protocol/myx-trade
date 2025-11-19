import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Tooltips } from '@/components/UI/Tooltips'
import { Trans } from '@lingui/react/macro'
// import { LongShortBar } from '../../components/LongShortBar'
import { InfoButton } from '@/components/UI/Button'
import { useTradePageStore } from '../../store/TradePageStore'
import { formatNumber } from '@/utils/number'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useMemo } from 'react'
import { DirectionEnum } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useGetWalletBalance } from '@/hooks/balance/use-get-wallet-balance'
import { ethers } from 'ethers'
import { useGetAccountPoolAssets } from '@/hooks/balance/use-get-account-pool-Assets'
import { TransferDialogButton } from './TransferDialog'
import { ReceiveDialogButton } from './ReceiveDialog'

export const MarginAccount = () => {
  const { symbolInfo } = useTradePageStore()
  const positionList = useGetPositionList()
  const { oraclePriceData } = useMarketStore()
  const marketPrice = oraclePriceData[symbolInfo?.poolId as string]?.price ?? 0
  const accountBalance = useGetAccountPoolAssets(symbolInfo?.poolId as string)

  const totalUnrealizedPnl = useMemo(() => {
    if (!positionList || positionList.length === 0) return '0'
    const symbolPositions = positionList.filter((item: any) => item.poolId === symbolInfo?.poolId)
    let totalPnl = parseBigNumber(0)
    symbolPositions.forEach((item: any) => {
      let pnl
      if (item.direction === DirectionEnum.Long) {
        pnl =
          parseBigNumber(marketPrice)
            .minus(parseBigNumber(item.entryPrice))
            .mul(parseBigNumber(item.size)) ?? '0'
      } else {
        pnl =
          parseBigNumber(item.entryPrice)
            .minus(parseBigNumber(marketPrice))
            .mul(parseBigNumber(item.size)) ?? '0'
      }

      totalPnl = totalPnl.plus(pnl)
    })

    return totalPnl.toFixed(2)
  }, [positionList, marketPrice, symbolInfo?.poolId])

  const tokenBalanceString = useGetWalletBalance()
  const walletBalance =
    ethers.formatUnits(tokenBalanceString, symbolInfo?.quoteDecimals ?? 6) ?? '0'

  return (
    <div className="mt-[20px] border-t-[1px] border-[#202129] pt-[24px] leading-[1]">
      <p className="text-[12px] font-medium text-[#CED1D9]">
        {symbolInfo?.baseSymbol}
        {symbolInfo?.quoteSymbol}
        <span className="ml-[4px]">
          <Trans>Margin</Trans>
        </span>
      </p>
      <div className="mt-[16px] flex flex-col gap-[14px] text-[12px] font-medium text-white">
        <FlexRowLayout
          left={
            <Tooltips title="Wallet Balance">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Wallet Balance</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {walletBalance
                ? formatNumber(walletBalance?.toString() ?? '0', { showUnit: false })
                : '0'}{' '}
              {symbolInfo?.quoteSymbol}
            </p>
          }
        />

        <FlexRowLayout
          left={
            <Tooltips title="Margin Balance">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Margin Balance</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {accountBalance
                ? formatNumber(
                    parseBigNumber(accountBalance?.freeAmount.toString())
                      .div(10 ** (symbolInfo?.quoteDecimals ?? 1))
                      .toString(),
                    { showUnit: false },
                  )
                : '0'}{' '}
              {symbolInfo?.quoteSymbol}
            </p>
          }
        />
        <FlexRowLayout
          left={
            <Tooltips title="Unlocking PnL">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Unlocking PnL</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {accountBalance?.profitIsReleased
                ? formatNumber(
                    parseBigNumber(accountBalance?.tradeableProfit.toString())
                      .div(10 ** (symbolInfo?.quoteDecimals ?? 1))
                      .toString(),
                    {
                      showUnit: false,
                    },
                  )
                : '0'}{' '}
              {symbolInfo?.quoteSymbol}
            </p>
          }
        />
        <FlexRowLayout
          left={
            <Tooltips title="Unrealized PnL">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Unrealized PnL</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {totalUnrealizedPnl
                ? formatNumber(totalUnrealizedPnl?.toString() ?? '0', { showUnit: false })
                : '0'}{' '}
              {symbolInfo?.quoteSymbol}
            </p>
          }
        />
      </div>

      <div className="mt-[12px] flex gap-[10px]">
        <ReceiveDialogButton />
        <TransferDialogButton />
      </div>
    </div>
  )
}
