import { Table } from '@/components/UI/Table'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
// import { InfoButton } from '@/components/UI/Button'
// import { Trans } from '@lingui/react/macro'
import { AdjustMarginDialog } from '@/components/Trade/Dialog/AdjustMargin'
import { DirectionEnum } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { TableNoData } from '../TableNoData'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

import { formatNumber } from '@/utils/number'
import { MarketClosePositionButton } from '../MarketClosePositionButton'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { TableWongNetwork } from '../TableNoData/TableWongNetwork'
import { TpSlButton } from '@/components/Trade/Dialog/TPSL'
import { useGetFundingFee } from '@/hooks/calculate/use-get-fundingfee'
import useSWR from 'swr'
import { useGetLiqPrice } from '@/hooks/calculate/use-get-liq-price'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useGetTradingFee } from '@/hooks/calculate/use-get-trading-fee'

const RenderLiqPrice = ({ position, marketPrice }: { position: any; marketPrice: string }) => {
  const { getLiqPrice } = useGetLiqPrice({ poolId: position.poolId, chainId: position.chainId })
  const { poolConfig } = useGetPoolConfig(position.poolId, position.chainId)

  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
  const { data: liqPrice } = useSWR(
    `getLiqPrice-${position.positionId}`,
    async () => {
      const rs = await getLiqPrice({
        entryPrice: position.entryPrice,
        collateralAmount: position.collateralAmount,
        size: position.size,
        price: marketPrice,
        assetClass: assetClass,
        fundingRateIndexEntry: position.fundingRateIndex,
        direction: position.direction,
        maintainMarginRate: poolConfig?.levelConfig?.maintainCollateralRate.toString() ?? '0',
      })

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )
  return (
    <>
      <p className="text-[12px] text-[#F29D39]">
        {parseBigNumber(liqPrice ?? '0').eq(0)
          ? '--'
          : formatNumber(liqPrice ?? '0', { showUnit: false })}
      </p>
      <p className="text-[12px] text-[white]">
        {parseBigNumber(position?.earlyClosePrice ?? '0').eq(0)
          ? '--'
          : formatNumber(position?.earlyClosePrice ?? 0, { showUnit: false })}
      </p>
    </>
  )
}

const RenderFundingFee = ({ position }: { position: any }) => {
  const { getFundingFee } = useGetFundingFee(position.poolId, position.chainId)

  const { data: fundingFee } = useSWR(
    `getFundingFee-${position.positionId}`,
    async () => {
      const rs = await getFundingFee(position.fundingRateIndex, position.size, position.direction)

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )

  return (
    <div
      className="text-[12px]"
      style={{ color: parseBigNumber(fundingFee ?? '0').gt(0) ? '#00E3A5' : '#EC605A' }}
    >
      {formatNumber(fundingFee ?? '0')} {position.quoteSymbol}
    </div>
  )
}

const RenderMarginRadio = ({ position, marketPrice }: { position: any; marketPrice: string }) => {
  let pnl
  if (position.direction === DirectionEnum.Long) {
    pnl =
      parseBigNumber(marketPrice)
        .minus(parseBigNumber(position.entryPrice))
        .mul(parseBigNumber(position.size)) ?? '0'
  } else {
    pnl =
      parseBigNumber(position.entryPrice)
        .minus(parseBigNumber(marketPrice))
        .mul(parseBigNumber(position.size)) ?? '0'
  }

  const { getFundingFee } = useGetFundingFee(position.poolId, position.chainId)
  const { getTradingFee } = useGetTradingFee()
  const { poolConfig } = useGetPoolConfig(position.poolId, position.chainId)

  const { data: marginRadio } = useSWR(
    `get_margin_radio_${position.positionId}`,
    async () => {
      const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
      const fundingFee = getFundingFee(position.fundingRateIndex, position.size, position.direction)
      const tradingFee = await getTradingFee({
        size: position.size,
        price: marketPrice,
        assetClass,
      })
      const positionValue = parseBigNumber(position.size).mul(position.entryPrice).mul(0.01)
      const collateralAmount = parseBigNumber(position.collateralAmount)
        .plus(pnl)
        .plus(parseBigNumber(fundingFee))
        .minus(parseBigNumber(tradingFee ?? '0'))

      const ratio = positionValue.div(collateralAmount)

      return ratio.mul(100).toFixed(2) ?? '0'
    },
    {
      refreshInterval: 10000,
    },
  )
  // Margin Ratio = (Position Size in USDC * 1%) / (Margin + Unrealized PNL + Pending Funding Fee - Close Position Fee)

  return <p className="text-[12px] text-[white]">{marginRadio ?? '0'}%</p>
}

export const Position = () => {
  const { tickerData } = useMarketStore()
  const { symbolInfo } = useTradePageStore()
  const positionList = useGetPositionList()
  const { isWrongNetwork } = useWalletConnection()

  return (
    <>
      <Table
        height={500}
        emptyText={isWrongNetwork ? <TableWongNetwork /> : <TableNoData />}
        columns={[
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Symbol`}</span>,
            key: 'symbol',
            align: 'left',
            minWidth: '100px',
            fixed: 'left',
            render: (_: string, record: any) => {
              return (
                <div>
                  <div className="text-[12px]">
                    {record.baseSymbol}
                    {record.quoteSymbol}
                  </div>
                  <div className="mt-[2px] flex items-center gap-[4px]">
                    <p
                      className="flex h-[18px] items-center justify-center rounded-[4px] px-[4px] py-[2px] text-[12px] leading-[12px]"
                      style={{
                        backgroundColor:
                          record.direction === DirectionEnum.Long ? '#00E3A51A' : '#FF00001A',
                        color: record.direction === DirectionEnum.Long ? '#00E3A5' : '#EC605A',
                      }}
                    >
                      {record.direction === DirectionEnum.Long ? t`Long` : t`Short`}
                    </p>
                    <p className="flex h-[18px] items-center justify-center rounded-[4px] bg-[#202129] px-[4px] py-[2px] text-[12px] leading-[12px] text-[white]">
                      {record.userLeverage}x
                    </p>
                  </div>
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex flex-col items-start gap-[2px]">
                <Tooltips
                  title={t`Open position amounts shown are calculated based on the actual coin quantity. Values change with the last price of the token`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Amount`}</span>
                </Tooltips>
              </div>
            ),
            key: 'amount',
            align: 'left',
            render: (_: string, record: any) => {
              const quoteValue = parseBigNumber(record.size)
                .mul(parseBigNumber(record.entryPrice))
                .toNumber()
              const formatBaseAmount = formatNumber(record.size, { showUnit: false })
              const quoteValueFormatted = formatNumber(quoteValue, { showUnit: false })
              return (
                <div className="text-[12px]">
                  <div className="flex flex-col items-center items-start gap-[4px]">
                    <p className="text-[12px] text-[#00E3A5]">
                      {formatBaseAmount} {record.baseSymbol}
                    </p>
                    <p className="text-[12px] text-[#9397a3]">
                      {quoteValueFormatted} {record.quoteSymbol}
                    </p>
                  </div>
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex flex-col items-start gap-[2px]">
                <Tooltips
                  title={t`The average position cost price for multiple opening and closing trades`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Entry Price`}</span>
                </Tooltips>
                <Tooltips
                  title={t`The current real-time oracle price, used to calculate unrealized PnL and margin.`}
                >
                  <span className="mt-[2px] cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Mark Price`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Entry',
            align: 'left',
            render: (_, record: any) => {
              const priceInfo = tickerData[record.poolId]
              return (
                <div className="text-[12px]">
                  <div className="flex flex-col items-center items-start gap-[4px]">
                    <p className="text-[12px] text-[white]">
                      {formatNumber(record.entryPrice, { showUnit: false })}
                    </p>
                    <p className="text-[12px] text-[white]">
                      {formatNumber(priceInfo?.price ?? 0, { showUnit: false })}
                    </p>
                  </div>
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex flex-col items-start gap-[2px]">
                <Tooltips
                  title={t`Margin used to maintain positions, subject to potential total loss upon liquidation`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Margin`}</span>
                </Tooltips>
                <Tooltips
                  title={t`Margin Ratio = (Position Size in USDC * 1%) / (Margin + Unrealized PNL + Pending Funding Fee - Close Position Fee)`}
                >
                  <span className="mt-[2px] cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Ratio`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Margin',
            align: 'left',
            width: '200px',
            render: (_, record: any) => {
              const marketPrice = tickerData[record.poolId]?.price.toString() ?? '0'

              return (
                <div className="justify-flex flex items-center text-[12px]">
                  <div className="flex flex-col items-center items-start gap-[4px]">
                    <p className="text-[12px] text-[white]">
                      {formatNumber(record.collateralAmount, { showUnit: false })}{' '}
                      {record.quoteSymbol}
                    </p>
                    <RenderMarginRadio position={record} marketPrice={marketPrice} />
                  </div>
                  <AdjustMarginDialog position={record} />
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex flex-col items-start gap-[2px]">
                <Tooltips
                  title={t`unPnL reflects the fluctuating profits or losses in your current position, tracking market price changes`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`unPnl`}</span>
                </Tooltips>
                <Tooltips title={t`Pnl/(Position Value /Leverage)`}>
                  <span className="mt-[2px] cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`ROE%`}</span>
                </Tooltips>
              </div>
            ),
            key: 'unPnl',
            align: 'left',
            width: '200px',
            render: (_, record: any) => {
              const marketPrice = tickerData[record.poolId]?.price ?? 0
              let pnl
              if (record.direction === DirectionEnum.Long) {
                pnl =
                  parseBigNumber(marketPrice)
                    .minus(parseBigNumber(record.entryPrice))
                    .mul(parseBigNumber(record.size)) ?? '0'
              } else {
                pnl =
                  parseBigNumber(record.entryPrice)
                    .minus(parseBigNumber(marketPrice))
                    .mul(parseBigNumber(record.size)) ?? '0'
              }
              const rate =
                pnl.div(parseBigNumber(record.collateralAmount)).mul(100).toFixed(2) ?? '0'

              return (
                <div className="flex flex-col items-center items-start gap-[4px]">
                  <p
                    className="text-[12px]"
                    style={{ color: pnl.toNumber() > 0 ? '#00E3A5' : '#EC605A' }}
                  >
                    {formatNumber(pnl.toString(), { showUnit: false })} {symbolInfo?.quoteSymbol}
                  </p>
                  <p
                    className="text-[12px]"
                    style={{ color: pnl.toNumber() > 0 ? '#00E3A5' : '#EC605A' }}
                  >
                    {rate}%
                  </p>
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex flex-col items-start gap-[2px]">
                <Tooltips
                  title={t`Your position will be liquidated when the oracle price falls below (long) or surpasses (short) that price`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Liq.Price`}</span>
                </Tooltips>
                <Tooltips
                  title={t`A system-set take-profit to secure extreme profits and protect the protocol`}
                >
                  <span className="mt-[2px] cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Auto TP Price`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Liq',
            width: '200px',
            align: 'left',
            render: (_, record: any) => {
              const priceInfo = tickerData[record.poolId]
              return (
                <div className="flex flex-col items-center items-start gap-[4px]">
                  <RenderLiqPrice
                    position={record}
                    marketPrice={priceInfo?.price.toString() ?? '0'}
                  />
                </div>
              )
            },
          },
          {
            title: (
              <div>
                <Tooltips
                  title={t`Accumulated funding fees will be settled each time the position size (coin) changes`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Funding Fee`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Funding Fee',
            align: 'left',
            width: '200px',
            render: (_: string, record: any) => <RenderFundingFee position={record} />,
          },
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`TP/SL`}</span>,
            key: 'TP/SL',
            align: 'left',
            render: (_, record: any) => (
              <div className="text-[12px]">
                <TpSlButton position={record} />
              </div>
            ),
          },
          {
            title: (
              <div>
                <p className="text-[12px] leading-[12px] text-[#9397a3]">{t`Actions`}</p>
              </div>
            ),
            key: 'Actions',
            align: 'right',
            fixed: 'right',
            render: (_, record: any) => {
              const priceInfo = tickerData[record.poolId]
              return (
                <div className="flex items-center justify-end gap-[4px]">
                  <MarketClosePositionButton
                    position={record}
                    marketPrice={priceInfo?.price.toString() ?? '0'}
                    symbolInfo={symbolInfo}
                  />
                </div>
              )
            },
          },
        ]}
        dataSource={positionList ?? []}
      />
    </>
  )
}
