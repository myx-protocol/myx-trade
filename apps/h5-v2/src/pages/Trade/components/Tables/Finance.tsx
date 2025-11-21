import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useQuery } from '@tanstack/react-query'
import { Table } from '@/components/UI/Table'
import { OperationEnum, type TradeFlowItem } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import dayjs from 'dayjs'
import { SymbolInfo } from '../SymbolInfo'
import { RiseFallText } from '@/components/RiseFallText'
import clsx from 'clsx'
import Big from 'big.js'
import { TradeFlowDetail } from '../TradeFlowDetail'
import { TableNoData } from '../TableNoData'
import { usePositionStore } from '@/store/position/createStore'
import { TransactionHash } from '@/components/TransactionHash'
import { TableWongNetwork } from '../TableNoData/TableWongNetwork'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'

const TradeFlowType: Record<OperationEnum, () => string> = {
  [OperationEnum.Increase]: () => t`开仓`,
  [OperationEnum.Decrease]: () => t`平仓`,
}

export const Finance = () => {
  const { client } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()
  const { isWalletConnected, address } = useWalletConnection()
  const { selectChainId, hideOthersSymbols } = usePositionStore()
  const { isWrongNetwork } = useWalletConnection()
  const { data: financeData, refetch } = useQuery({
    queryKey: [
      'finance',
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
      const res = await client.account.getTradeFlow({
        chainId: selectChainId === '0' ? 0 : Number(selectChainId),
        poolId: hideOthersSymbols ? symbolInfo?.poolId : undefined,
      })
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
    <Table<TradeFlowItem>
      height={500}
      emptyText={isWrongNetwork ? <TableWongNetwork /> : <TableNoData />}
      columns={[
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`时间`}</span>,
          key: 'orderTime',
          align: 'left',
          width: '120px',
          minWidth: '120px',
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
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`类型`}</span>,
          key: 'type',
          align: 'left',
          width: '100px',
          minWidth: '100px',
          render: (_, record) => {
            return (
              <div className="text-[12px]">{TradeFlowType[record.type as OperationEnum]?.()}</div>
            )
          },
        },
        {
          title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`合约`}</span>,
          key: 'baseSymbol',
          align: 'left',
          width: '82px',
          render: (_, record) => (
            <SymbolInfo
              direction={null}
              baseSymbol={record.baseSymbol}
              quoteSymbol={record.quoteSymbol}
              leverage={null}
            />
          ),
        },
        {
          title: (
            <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`资金流水`}</span>
          ),
          key: 'realizedPnl',
          align: 'right',
          width: '150px',
          render: (_, record) => {
            return (
              <TradeFlowDetail
                tradeFlow={record}
                trigger={
                  <span
                    className={clsx('border-b-[1px] border-dashed text-[12px]', {
                      'border-green': Big(record.afterCollateralAmount).gt(0),
                      'border-danger': Big(record.afterCollateralAmount).lt(0),
                    })}
                  >
                    <RiseFallText
                      value={record.afterCollateralAmount}
                      renderOptions={{
                        showUnit: false,
                        showSign: true,
                      }}
                    />
                  </span>
                }
              />
            )
          },
        },
        {
          title: (
            <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`哈希`}</span>
          ),
          key: 'txHash',
          align: 'right',
          width: '150px',
          render: (_, record) => (
            <div className="">
              <TransactionHash hash={record.txHash} chainId={record.chainId} />
            </div>
          ),
        },
      ]}
      dataSource={financeData || []}
    />
  )
}
