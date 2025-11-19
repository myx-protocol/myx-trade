import { useTradePageStore } from '@/components/Trade/store/TradePageStore'

import { Table } from '@/components/UI/Table'
import { Tooltips } from '@/components/UI/Tooltips'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { SymbolInfo } from '../SymbolInfo'
import { CloseTypeEnum, type PositionHistoryItem } from '@myx-trade/sdk'
import clsx from 'clsx'
import Big from 'big.js'
import { TableNoData } from '../TableNoData'
import { usePositionStore } from '@/store/position/createStore'
import { getProfitRatePrecision } from '@/utils/math'
import { useMount } from 'ahooks'

const OrderCloseType: Partial<Record<CloseTypeEnum, () => string>> = {
  [CloseTypeEnum.PartialClose]: () => t`部分平仓`,
  [CloseTypeEnum.Liquidation]: () => t`强制平仓`,
  [CloseTypeEnum.FullClose]: () => t`全部平仓`,
  [CloseTypeEnum.EarlyClose]: () => t`提前平仓`,
  [CloseTypeEnum.MarketClose]: () => t`市场平仓`,
}

export const PositionHistory = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()
  const { address } = useWalletConnection()
  const { selectChainId, hideOthersSymbols } = usePositionStore()
  const { data } = useQuery({
    queryKey: ['positionHistory', symbolInfo?.poolId, address, selectChainId, hideOthersSymbols],
    enabled: Boolean(
      address && symbolInfo?.poolId && symbolInfo?.chainId && !!client && clientIsAuthenticated,
    ),
    queryFn: async () => {
      console.log('clientIsAuthenticated', clientIsAuthenticated)
      console.log('client', client)
      if (!client || !clientIsAuthenticated) return null
      const res = await client.position.getPositionHistory({
        chainId: selectChainId === '0' ? 0 : Number(selectChainId),
        poolId: hideOthersSymbols ? symbolInfo?.poolId : undefined,
      })
      return res
    },
  })
  useMount(() => {
    console.log(
      'useMount',
      Boolean(
        address && symbolInfo?.poolId && symbolInfo?.chainId && !!client && clientIsAuthenticated,
      ),
    )
  })
  return (
    <Table<PositionHistoryItem>
      emptyText={<TableNoData />}
      columns={[
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`合约`}</span>,
          key: 'baseSymbol',
          align: 'left',
          width: '100px',
          minWidth: '100px',
          fixed: 'left',
          render: (_, record) => {
            return (
              <div>
                <SymbolInfo
                  direction={record.direction}
                  baseSymbol={record.baseSymbol}
                  quoteSymbol={record.quoteSymbol}
                  leverage={record.userLeverage}
                />
              </div>
            )
          },
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Status`}</span>,
          key: 'status',
          align: 'left',
          width: '120px',
          render: (_, record) => (
            <div className="text-[12px]">
              <span>{OrderCloseType[record.closeType]?.()}</span>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`The average position cost price for multiple opening and closing trades`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Avg. Entry Price`}</span>
              </Tooltips>
            </div>
          ),
          key: 'entryPrice',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="text-[12px]">
              <div className="flex flex-col items-center items-start gap-[4px]">
                <p className="text-[12px] text-[white]">
                  {formatNumber(record.entryPrice, {
                    showUnit: false,
                  })}
                </p>
              </div>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`Margin used to maintain positions, subject to potential total loss upon liquidation`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Avg. Close Price`}</span>
              </Tooltips>
            </div>
          ),
          key: 'avgClosePrice',
          align: 'left',
          width: '150px',
          render: (_, record) => {
            const profitRate = getProfitRatePrecision(
              record.realizedPnl || '0',
              record.collateralAmount || '0',
            )
            return (
              <div
                className={clsx('justify-flex flex items-center text-[12px]', {
                  'text-green': Big(record.realizedPnl || 0).gt(0),
                  'text-danger': Big(record.realizedPnl || 0).lt(0),
                  'text-white': Big(record.realizedPnl || 0).eq(0),
                })}
              >
                <div className="flex flex-col items-center items-start gap-[4px]">
                  ${' '}
                  {formatNumber(record.avgClosePrice || 0, {
                    showUnit: false,
                  })}
                  / {profitRate}
                </div>
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
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Realized PnL`}</span>
              </Tooltips>
            </div>
          ),
          key: 'realizedPnl',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="">
              <span>
                {formatNumber(record.realizedPnl, {
                  showUnit: false,
                })}
              </span>
              <span className="ml-[2px]">{record.quoteSymbol || ''}</span>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`Your position will be liquidated when the oracle price falls below (long) or surpasses (short) that price`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Total Amount`}</span>
              </Tooltips>
            </div>
          ),
          key: 'size',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="">
              <span>
                {formatNumber(record.size, {
                  showUnit: false,
                })}
              </span>
              <span className="ml-[2px]">{record.baseSymbol || ''}</span>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`Your position will be liquidated when the oracle price falls below (long) or surpasses (short) that price`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Closed Amount`}</span>
              </Tooltips>
            </div>
          ),
          key: 'closedAmount',
          align: 'left',
          width: '100px',
          render: (_, record) => (
            <div className="text-[12px]">
              {formatNumber(record.filledSize, {
                showUnit: false,
              })}{' '}
              <span>{record.baseSymbol || ''}</span>
            </div>
          ),
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Open Time`}</span>,
          key: 'openTime',
          align: 'left',
          width: '70px',
          render: (_, record) => (
            <div className="text-[12px]">
              {record.openTime ? dayjs.unix(record.openTime).format('YYYY/MM/DD HH:mm:ss') : '--'}
            </div>
          ),
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Close Time`}</span>,
          key: 'closeTime',
          align: 'left',
          width: '70px',
          render: (_, record) => (
            <div className="text-[12px]">
              {record.closeTime ? dayjs.unix(record.closeTime).format('YYYY/MM/DD HH:mm:ss') : '--'}
            </div>
          ),
        },
      ]}
      dataSource={data?.data || []}
    />
  )
}
