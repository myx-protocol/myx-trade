import { Table } from '@/components/UI/Table'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { EditIcon } from '@/components/UI/Icon'
import { AdjustMarginDialog } from '@/components/Trade/Dialog/AdjustMargin'
import dayjs from 'dayjs'
import { Direction, OrderTypeEnum } from '@myx-trade/sdk'
import { CancelOrderButton } from '../CancelOrderButton'
import { TableNoData } from '../TableNoData'
import { displayAmount } from '@/utils/number'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { TableWongNetwork } from '../TableNoData/TableWongNetwork'
import { TpSlButton } from '@/components/Trade/Dialog/TPSL'

export const Entrusts = () => {
  const orders = useGetOrderList()
  const { isWrongNetwork } = useWalletConnection()
  return (
    <>
      <Table
        height={500}
        emptyText={isWrongNetwork ? <TableWongNetwork /> : <TableNoData />}
        columns={[
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Time`}</span>,
            key: 'time',
            align: 'left',
            width: '100px',
            minWidth: '100px',
            fixed: 'left',
            render: (_: string, record: any) => {
              return (
                <div>
                  <div className="text-[12px]">
                    {dayjs(record.txTime * 1000).format('YYYY/MM/DD')}
                  </div>
                  <div className="text-[12px]">
                    {dayjs(record.txTime * 1000).format('HH:mm:ss')}
                  </div>
                </div>
              )
            },
          },
          {
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Symbol`}</span>,
            key: 'symbol',
            align: 'left',
            minWidth: '100px',
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
                          record.direction === Direction.LONG ? '#00E3A51A' : '#FF00001A',
                        color: record.direction === Direction.LONG ? '#00E3A5' : '#EC605A',
                      }}
                    >
                      {record.direction === Direction.LONG ? t`Long` : t`Short`}
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
            title: <span className="text-[12px] leading-[12px] text-[#9397a3]">{t`Type`}</span>,
            key: 'type',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              if (record.direction === Direction.LONG) {
                let orderType = t`Limit Open`
                if (record.orderType === OrderTypeEnum.Market) {
                  orderType = t`Market Open`
                }
                return (
                  <div>
                    <div className="text-[12px]">{orderType}</div>
                  </div>
                )
              }

              let orderType = t`Limit Close`
              if (record.orderType === OrderTypeEnum.Market) {
                orderType = t`Market Close`
              }
              return (
                <div>
                  <div className="text-[12px]">{orderType}</div>
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
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Price`}</span>
                </Tooltips>
              </div>
            ),
            key: 'price',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              return (
                <div className="justify-flex flex items-center gap-[4px] text-[12px]">
                  <p className="text-[12px] text-[white]">{displayAmount(record.price)}</p>
                  <EditIcon />
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex items-start gap-[2px]">
                <Tooltips
                  title={t`Margin used to maintain positions, subject to potential total loss upon liquidation`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Amount`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Amount',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              return (
                <div className="flex flex-col items-center items-start gap-[4px]">
                  <div className="justify-flex flex items-center gap-[4px] text-[12px]">
                    <p className="text-[12px] text-[white]">
                      {displayAmount(record.size)} {record.baseSymbol}
                    </p>
                    <EditIcon />
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
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Trigger Price`}</span>
                </Tooltips>
              </div>
            ),
            key: 'triggerPrice',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              return (
                <div className="justify-flex flex items-center gap-[4px] text-[12px]">
                  <p className="text-[12px] text-[white]">
                    {record.price} {record.quoteSymbol}
                  </p>
                  <EditIcon />
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex items-start gap-[2px]">
                <Tooltips
                  title={t`Margin used to maintain positions, subject to potential total loss upon liquidation`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`Margin`}</span>
                </Tooltips>
              </div>
            ),
            key: 'Margin',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              return (
                <div className="justify-flex flex items-center gap-[4px] text-[12px]">
                  <p className="text-[12px] text-[white]">
                    +{displayAmount(record.collateralAmount)} {record.quoteSymbol}
                  </p>
                  <AdjustMarginDialog position={record} />
                </div>
              )
            },
          },
          {
            title: (
              <div className="flex items-start gap-[2px]">
                <Tooltips
                  title={t`Margin used to maintain positions, subject to potential total loss upon liquidation`}
                >
                  <span className="cursor-pointer text-[12px] leading-[12px] text-[#9397a3] underline decoration-dotted underline-offset-[2px]">{t`TP/SL`}</span>
                </Tooltips>
              </div>
            ),
            key: 'tpSl',
            align: 'left',
            minWidth: '100px',
            render: (_: string, record: any) => {
              return (
                <div className="justify-flex flex items-center gap-[4px] text-[12px]">
                  <TpSlButton position={record} />
                </div>
              )
            },
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
            render: (_: string, record: any) => (
              <div className="flex items-center justify-end gap-[4px]">
                <CancelOrderButton orderId={record.orderId} />
              </div>
            ),
          },
        ]}
        dataSource={orders ?? []}
      />
    </>
  )
}
