import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { Table } from '@/components/UI/Table'
import { Tooltips } from '@/components/UI/Tooltips'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import type { HistoryOrderItem } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { SymbolInfo } from '../SymbolInfo'
import { OrderStatus } from '../OrderStatus'
import { OrderType } from '../OrderType'
import { TableNoData } from '../TableNoData'
import { usePositionStore } from '@/store/position/createStore'
import { TableWongNetwork } from '../TableNoData/TableWongNetwork'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'
import { parseBigNumber } from '@/utils/bn'

export const OrderHistory = () => {
  const { client } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()
  const { isWalletConnected, address, isWrongNetwork } = useWalletConnection()
  const { selectChainId, hideOthersSymbols } = usePositionStore()
  const { data: orderHistory, refetch } = useQuery({
    queryKey: [
      'orderHistory',
      symbolInfo?.poolId,
      address,
      selectChainId,
      hideOthersSymbols,
      isWrongNetwork,
    ],
    enabled: Boolean(
      isWalletConnected &&
        address &&
        symbolInfo?.poolId &&
        symbolInfo?.chainId &&
        !!client &&
        !isWrongNetwork,
    ),
    queryFn: async () => {
      if (!client || !isWalletConnected) return null
      const res = await client.order.getOrderHistory(
        {
          chainId: selectChainId === '0' ? 0 : Number(selectChainId),
          poolId: hideOthersSymbols ? symbolInfo?.poolId : undefined,
        },
        address ?? '',
      )
      return res.data
    },
  })

  useEffect(() => {
    const onRefresh = () => {
      refetch()
    }
    tradePubSub.on('place:order:success', onRefresh)
    return () => {
      tradePubSub.off('place:order:success', onRefresh)
    }
  }, [])
  return (
    <Table<HistoryOrderItem>
      height={500}
      emptyText={isWrongNetwork ? <TableWongNetwork /> : <TableNoData />}
      columns={[
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`时间`}</span>,
          key: 'orderTime',
          align: 'left',
          width: '66px',
          minWidth: '66px',
          render: (_, record) => {
            return (
              <div>
                <div className="text-[12px]">
                  {dayjs.unix(record.txTime).format('YYYY/MM/DD HH:mm:ss')}
                </div>
              </div>
            )
          },
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`合约`}</span>,
          key: 'symbol',
          align: 'left',
          width: '100px',
          minWidth: '100px',
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
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`类型`}</span>,
          key: 'orderType',
          align: 'left',
          width: '120px',
          render: (_, record) => (
            <OrderType orderType={record.orderType} operation={record.operation} />
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`The average position cost price for multiple opening and closing trades`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Avg. Price`}</span>
              </Tooltips>
            </div>
          ),
          key: 'lastPrice',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="text-[12px]">
              <div className="flex flex-col items-center items-start gap-[4px]">
                <p className="text-[12px] text-[white]">
                  {parseBigNumber(record.lastPrice).eq(0)
                    ? '--'
                    : formatNumber(record.lastPrice, {
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
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Price`}</span>
              </Tooltips>
            </div>
          ),
          key: 'price',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="justify-flex flex items-center text-[12px]">
              <div className="flex flex-col items-center items-start gap-[4px]">
                {parseBigNumber(record.price).eq(0)
                  ? '--'
                  : formatNumber(record.price, {
                      showUnit: false,
                    })}
              </div>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`unPnL reflects the fluctuating profits or losses in your current position, tracking market price changes`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`数量`}</span>
              </Tooltips>
            </div>
          ),
          key: 'size',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="">
              <span>
                {parseBigNumber(record.size).eq(0)
                  ? '--'
                  : formatNumber(record.size, {
                      showUnit: false,
                    })}
              </span>
              <span className="ml-[2px]">{record.baseSymbol}</span>
            </div>
          ),
        },
        {
          title: (
            <div className="flex flex-col items-start gap-[2px]">
              <Tooltips
                title={t`Your position will be liquidated when the oracle price falls below (long) or surpasses (short) that price`}
              >
                <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`成交数量`}</span>
              </Tooltips>
            </div>
          ),
          key: 'filledSize',
          align: 'left',
          width: '150px',
          render: (_, record) => (
            <div className="">
              <span>
                {parseBigNumber(record.filledSize).eq(0)
                  ? '--'
                  : formatNumber(record.filledSize, {
                      showUnit: false,
                    })}
              </span>
              <span className="ml-[2px]">{record.baseSymbol}</span>
            </div>
          ),
        },
        {
          title: <div>{t`Fee`}</div>,
          key: 'tradingFee',
          align: 'left',
          width: '100px',
          render: (_, record) => (
            <div className="text-[12px]">
              {parseBigNumber(record.tradingFee).eq(0)
                ? '--'
                : formatNumber(record.tradingFee, {
                    showUnit: false,
                  })}
            </div>
          ),
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Status`}</span>,
          key: 'orderStatus',
          align: 'left',
          width: '100px',
          render: (_, record) => <OrderStatus orderStatus={record.orderStatus} />,
        },
      ]}
      dataSource={orderHistory || []}
    />
  )
}
