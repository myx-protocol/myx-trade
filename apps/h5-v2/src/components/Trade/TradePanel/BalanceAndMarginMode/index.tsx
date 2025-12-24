import { displayAmount, formatNumber, formatNumberWithBaseToken } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import Reverse from '@/components/Icon/set/ReverseV2'
import { ArrowDown } from '@/components/Icon'
import { useTradePanelStore } from '../store'
import clsx from 'clsx'
import { useTradePageStore } from '../../store/TradePageStore'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useMarketStore } from '../../store/MarketStore'
import { parseBigNumber } from '@/utils/bn'
import { DirectionEnum, type MarketDetailResponse } from '@myx-trade/sdk'
import { useBoolean } from 'ahooks'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Tooltips } from '@/components/UI/Tooltips'
import { PrimaryButton } from '@/components/UI/Button'
import { TransferDialogButton } from '../MarginAccount/TransferDialog'
import useGlobalStore from '@/store/globalStore'

const useCountdown = (targetTimestamp: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const formatCountdown = useCallback((seconds: number): string => {
    if (seconds <= 0) return '00:00:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    }
    return `${pad(minutes)}:${pad(secs)}`
  }, [])

  useEffect(() => {
    if (!targetTimestamp || targetTimestamp <= 0) {
      setRemainingSeconds(0)
      return
    }

    const calculateRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = targetTimestamp - now
      return remaining > 0 ? remaining : 0
    }

    setRemainingSeconds(calculateRemaining())

    const timer = setInterval(() => {
      const remaining = calculateRemaining()
      setRemainingSeconds(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetTimestamp])

  return {
    remainingSeconds,
    countdownText: formatCountdown(remainingSeconds),
    isExpired: remainingSeconds <= 0,
  }
}

export const AssetsDialogButton = ({ symbol }: { symbol?: MarketDetailResponse }) => {
  const [open, setOpen] = useState(false)
  const { poolList } = useGlobalStore()
  const { symbolInfo: tradeSymbol } = useTradePageStore()
  const positionList = useGetPositionList()
  const { tickerData } = useMarketStore()
  const symbolInfo = symbol ?? tradeSymbol
  const marketPrice = tickerData[symbolInfo?.poolId as string]?.price ?? 0
  const { setReceiveDialogOpen } = useTradePanelStore()

  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

  const releaseTime = Number(accountAssets?.releaseTime ?? 0)
  const { countdownText, isExpired } = useCountdown(releaseTime)

  const { checkWalletChainId } = useWalletChainCheck()

  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === symbolInfo?.poolId)
  }, [poolList, symbolInfo?.poolId])

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

  const totalPositionMargin = useMemo(() => {
    const theSameQuotePoolIds =
      poolList
        ?.filter?.((item: any) => item.quoteToken === pool?.quoteToken)
        ?.map?.((item: any) => item.poolId) ?? []
    const filteredPositionList = positionList?.filter?.((item: any) =>
      theSameQuotePoolIds?.includes?.(item.poolId),
    )

    const totalPositionMargin =
      filteredPositionList?.reduce?.((acc: Big, item: any) => {
        const total = parseBigNumber(acc)
        const size = total.plus(parseBigNumber(item.collateralAmount))
        return size.toString()
      }, '0') ?? '0'

    return parseBigNumber(totalPositionMargin)
      .plus(parseBigNumber(accountAssets?.usedMargin?.toString() ?? '0'))
      .toString()
  }, [positionList, accountAssets?.usedMargin, poolList, pool?.quoteToken])

  const [isSwitchNetwork, { setTrue: setIsSwitchNetworkTrue, setFalse: setIsSwitchNetworkFalse }] =
    useBoolean(false)

  const onReceive = () => {
    if (!symbolInfo?.chainId) return
    setIsSwitchNetworkTrue()
    checkWalletChainId(symbolInfo.chainId).then(() => {
      setIsSwitchNetworkFalse()
      setReceiveDialogOpen(true)
    })
  }
  return (
    <>
      <Reverse size={14} color="#00E3A5" onClick={() => setOpen(true)} />
      {open && (
        <DialogBase
          title={t`Assets`}
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            '& .MuiDialog-paper': {
              paddingLeft: 0,
              paddingRight: 0,
              width: '390px',
            },
            '& .MuiDialogTitle-root': {
              paddingLeft: '20px',
              marginRight: '20px',
            },
          }}
        >
          <div className="mt-[16px] flex flex-col gap-[14px] px-[16px] text-[12px] font-medium text-white">
            <FlexRowLayout
              left={
                <Tooltips
                  title={t`Max capital for opening new positions. Aggregates Free Margin, Wallet Balance, and Locked Realized PnL (${symbolInfo?.quoteSymbol ?? ''} Locked Realized PnL)`}
                >
                  <p className="text-tooltip font-normal text-[#9397A3]">
                    <Trans>Available Margin</Trans>
                  </p>
                </Tooltips>
              }
              right={
                <p>
                  {displayAmount(accountAssets?.availableMargin?.toString() ?? '0')}{' '}
                  {symbolInfo?.quoteSymbol}
                </p>
              }
            />
            <FlexRowLayout
              left={
                <Tooltips
                  title={t`Settled available balance in your margin account, withdrawable to on-chain wallet anytime.`}
                >
                  <p className="text-tooltip font-normal text-[#9397A3]">
                    <Trans>Free Margin</Trans>
                  </p>
                </Tooltips>
              }
              right={
                <p>
                  {displayAmount(accountAssets?.freeMargin?.toString() ?? '0')}{' '}
                  {symbolInfo?.quoteSymbol}
                </p>
              }
            />
            <FlexRowLayout
              left={
                <Tooltips title={t`Current USDC asset balance held in your on-chain wallet.`}>
                  <p className="text-tooltip font-normal text-[#9397A3]">
                    <Trans>Wallet Balance</Trans>
                  </p>
                </Tooltips>
              }
              right={
                <p>
                  {displayAmount(accountAssets?.walletBalance?.toString() ?? '0')}{' '}
                  {symbolInfo?.quoteSymbol}
                </p>
              }
            />
            <FlexRowLayout
              left={
                <Tooltips
                  title={t`Realized profits (${symbolInfo?.quoteSymbol ?? ''} undergoing unlocking cycle. Not withdrawable, but usable for opening new positions.`}
                >
                  <p className="text-tooltip font-normal text-[#9397A3]">
                    <Trans>Locked Realized Pnl</Trans>
                  </p>
                </Tooltips>
              }
              right={
                <>
                  {!isExpired &&
                  parseBigNumber(accountAssets?.quoteProfit?.toString() ?? '0').gt(0) ? (
                    <Tooltips title={t`Available for withdrawal to wallet after ${countdownText}`}>
                      <p className="text-tooltip font-normal">
                        {displayAmount(accountAssets?.quoteProfit?.toString() ?? '0')}{' '}
                        {symbolInfo?.quoteSymbol}
                      </p>
                    </Tooltips>
                  ) : (
                    <p>
                      {displayAmount(accountAssets?.quoteProfit?.toString() ?? '0')}{' '}
                      {symbolInfo?.quoteSymbol}
                    </p>
                  )}
                </>
              }
            />
            <FlexRowLayout
              left={
                <Tooltips
                  title={t`Total floating PnL for all ${symbolInfo?.quoteSymbol ?? ''} positions, based on oracle price.`}
                >
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

            <div className="flex flex-col gap-[10px]">
              <FlexRowLayout
                left={
                  <Tooltips
                    title={t`Total margin actively utilized by all open positions and pending orders in ${symbolInfo?.quoteSymbol ?? ''} markets.`}
                  >
                    <p className="text-tooltip font-normal text-[#9397A3]">
                      <Trans>Used Margin</Trans>
                    </p>
                  </Tooltips>
                }
                right={
                  <p>
                    {totalPositionMargin
                      ? formatNumber(totalPositionMargin?.toString() ?? '0', { showUnit: false })
                      : '0'}{' '}
                    {symbolInfo?.quoteSymbol}
                  </p>
                }
              />
              <FlexRowLayout
                left={
                  <Tooltips
                    title={t`${symbolInfo?.baseSymbol ?? ''} tokens in trading account that have completed unlocking and are withdrawable.`}
                  >
                    <p className="text-tooltip font-normal text-[#9397A3]">
                      <Trans>Withdrawable {symbolInfo?.baseSymbol ?? ''}</Trans>
                    </p>
                  </Tooltips>
                }
                right={
                  <>
                    {!isExpired &&
                    parseBigNumber(accountAssets?.freeBaseAmount?.toString() ?? '0').gt(0) ? (
                      <Tooltips title={`${countdownText}`}>
                        <p className="text-tooltip font-normal">
                          {displayAmount(accountAssets?.freeBaseAmount?.toString() ?? '0')}{' '}
                          {symbolInfo?.quoteSymbol}
                        </p>
                      </Tooltips>
                    ) : (
                      <p>
                        {displayAmount(accountAssets?.freeBaseAmount?.toString() ?? '0')}{' '}
                        {symbolInfo?.baseSymbol}
                      </p>
                    )}
                  </>
                }
              />
              <FlexRowLayout
                left={
                  <Tooltips
                    title={t`Realized ${symbolInfo?.baseSymbol ?? ''} token profits undergoing unlocking cycle. Claimable after unlocking completes.`}
                  >
                    <p className="text-tooltip font-normal text-[#9397A3]">
                      <Trans>Locked Realized Pnl {symbolInfo?.baseSymbol ?? ''}</Trans>
                    </p>
                  </Tooltips>
                }
                right={
                  <Tooltips title={t``}>
                    <p>
                      {displayAmount(accountAssets?.baseProfit?.toString() ?? '0')}{' '}
                      {symbolInfo?.baseSymbol}
                    </p>
                  </Tooltips>
                }
              />
            </div>
            <div className="mt-[20px] flex gap-[10px]">
              <PrimaryButton
                className="w-full"
                style={{ height: '40px' }}
                onClick={onReceive}
                loading={isSwitchNetwork}
              >
                <Trans>Receive</Trans>
              </PrimaryButton>
              <TransferDialogButton />
            </div>
          </div>
        </DialogBase>
      )}
    </>
  )
}

export const Balance = () => {
  const { symbolInfo } = useTradePageStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

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
      <AssetsDialogButton />
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
