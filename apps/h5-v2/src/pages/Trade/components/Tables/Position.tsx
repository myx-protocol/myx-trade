import { Table } from '@/components/UI/Table'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { EditIcon } from '@/components/UI/Icon'
import { InfoButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { AdjustMarginDialog } from '@/components/Trade/Dialog/AdjustMargin'
import { DirectionEnum } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { TableNoData } from '../TableNoData'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

import { formatNumber } from '@/utils/number'
import { MarketClosePositionButton } from '../MarketClosePositionButton'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'

export const Position = () => {
  const { oraclePriceData } = useMarketStore()
  const { symbolInfo } = useTradePageStore()
  const positionList = useGetPositionList()

  return (
    <>
      <AdjustMarginDialog />
      <Table
        emptyText={<TableNoData />}
        columns={[
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Symbol`}</span>,
            key: 'symbol',
            align: 'left',
            width: '100px',
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
              const priceInfo = oraclePriceData[record.poolId]
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
                  title={t`Margin Ratio = (Position Size in USDC * 1%) / (Margin + Unrealized P/L + Pending Funding Fee - Close Position Fee)`}
                >
                  <span className="mt-[2px] cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Ratio`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Margin',
            align: 'left',
            render: (_, record: any) => {
              return (
                <div className="justify-flex flex items-center text-[12px]">
                  <div className="flex flex-col items-center items-start gap-[4px]">
                    <p className="text-[12px] text-[white]">
                      {record.collateralAmount} {record.quoteSymbol}
                    </p>
                    <p className="text-[12px] text-[white]">3.33%</p>
                  </div>
                  <EditIcon />
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
            render: (_, record: any) => {
              const marketPrice = oraclePriceData[record.poolId]?.price ?? 0
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
            align: 'left',
            render: () => (
              <div className="flex flex-col items-center items-start gap-[4px]">
                <p className="text-[12px] text-[#F29D39]">98,765.43</p>
                <p className="text-[12px] text-[white]">98,765.43</p>
              </div>
            ),
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
            render: () => <div className="text-[12px]">-2.34 USDC</div>,
          },
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`TP/SL`}</span>,
            key: 'TP/SL',
            align: 'left',
            render: () => (
              <div className="text-[12px]">
                <InfoButton onClick={() => {}}>
                  +<Trans>Add</Trans>
                </InfoButton>
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
              const priceInfo = oraclePriceData[record.poolId]
              return (
                <div className="flex items-center justify-end gap-[4px]">
                  <MarketClosePositionButton
                    position={record}
                    marketPrice={priceInfo?.price ?? 0}
                    symbolInfo={symbolInfo}
                  />
                  {/* <InfoButton onClick={() => { }}>
                    <Trans>Close</Trans>
                  </InfoButton> */}
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
