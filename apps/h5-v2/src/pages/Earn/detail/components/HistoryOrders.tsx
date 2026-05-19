import { Box, Skeleton } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { type ReactNode, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type PoolHistoryOrder, LpOrderStatus, LpOrderType } from '@/request/lp/type.ts'
import { getPoolHistoryOrders } from '@/request'
import { PoolType, PageDirection, type Address } from '@/request/type.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { PairLogo } from '@/components/UI/PairLogo'
import type { ChainId } from '@/config/chain.ts'
import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy.tsx'
import { Empty } from '@/components/Empty.tsx'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { formatNumber } from '@/utils/number.ts'
import dayjs from 'dayjs'
import { PoolContext } from '@/pages/Earn/context.ts'
import { t } from '@lingui/core/macro'

const limit = 20

const orderTypeLabel: Record<LpOrderType, ReactNode> = {
  [LpOrderType.Buy]: <Trans>Subscribe</Trans>,
  [LpOrderType.Sell]: <Trans>Redeem</Trans>,
  [LpOrderType.TP]: <Trans>TP</Trans>,
  [LpOrderType.SL]: <Trans>SL</Trans>,
}
const orderTypeColorMap: Record<number, string> = {
  [LpOrderType.Buy]: 'text-[#00E3A5]',
  [LpOrderType.Sell]: 'text-[#FF5C5C]',
  [LpOrderType.TP]: 'text-[#00E3A5]',
  [LpOrderType.SL]: 'text-[#FF5C5C]',
}

const orderStatusLabel: Record<LpOrderStatus, ReactNode> = {
  [LpOrderStatus.Cancel]: <Trans>Cancelled</Trans>,
  [LpOrderStatus.Expired]: <Trans>Expired</Trans>,
  [LpOrderStatus.Completed]: <Trans>Completed</Trans>,
}

const orderStatusColor: Record<LpOrderStatus, string> = {
  [LpOrderStatus.Cancel]: 'text-[#848E9C]',
  [LpOrderStatus.Expired]: 'text-[#848E9C]',
  [LpOrderStatus.Completed]: 'text-[#CED1D9]',
}

export const HistoryOrders = ({ showAll, chainId }: { showAll: boolean; chainId?: number }) => {
  const { accessToken } = useAccessToken()
  const { address: account } = useWalletConnection()
  const { poolId } = useContext(PoolContext)

  const [list, setList] = useState<PoolHistoryOrder[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)

  const queryKey = [
    'getQuotePoolHistoryOrders',
    chainId,
    account,
    accessToken,
    cursor,
    showAll,
    poolId,
  ]

  const { isLoading } = useQuery({
    queryKey,
    enabled: !!account,
    queryFn: async () => {
      const paginatedLimit = limit + 1
      const result = await getPoolHistoryOrders(account as Address, accessToken || '', {
        chainId,
        poolType: PoolType.quote,
        limit: paginatedLimit,
        direction: cursor ? PageDirection.Next : undefined,
        cursor,
        poolId: showAll ? undefined : poolId,
      })
      const data = result?.data || []
      setHasMore(data.length >= paginatedLimit)
      const sliced = data.slice(0, limit)
      if (cursor) {
        setList((prev) => [...prev, ...sliced])
      } else {
        setList(sliced)
      }
      return sliced
    },
    placeholderData: (prev) => prev,
  })

  const loadMore = () => {
    if (list.length > 0) {
      setCursor(list[list.length - 1].orderId.toString())
    }
  }

  useEffect(() => {
    setCursor(undefined)
    setHasMore(true)
    setList([])
  }, [chainId, account, accessToken])

  return (
    <Box className={'px-[16px]'}>
      <InfiniteScrollView
        dataLength={list.length}
        loadMore={loadMore}
        hasMore={hasMore}
        scrollableTarget={null}
      >
        <Box className={'flex flex-col'}>
          {(isLoading
            ? (Array.from({ length: 3 }).fill(null) as (PoolHistoryOrder | null)[])
            : list
          ).map((item, index) => (
            <HistoryOrderCard
              key={`${item?.orderId}-${item?.txHash || index}`}
              order={item}
              isLoading={isLoading && !item}
            />
          ))}
          {!isLoading && list.length === 0 && <Empty />}
        </Box>
      </InfiniteScrollView>
    </Box>
  )
}

const HistoryOrderCard = ({
  order,
  isLoading,
}: {
  order: PoolHistoryOrder | null
  isLoading: boolean
}) => {
  const explorerUrl = order
    ? CHAIN_INFO?.[Number(order.chainId) as ChainId]?.explorerOfTX
    : undefined

  return (
    <Box className={'border-b-base flex flex-col gap-[20px] border-b py-[16px]'}>
      {/* Header */}
      <Box className={'flex items-center justify-between'}>
        <Box className={'flex items-center gap-[4px]'}>
          <PairLogo
            baseSymbol={order?.baseSymbol}
            quoteSymbol={order?.quoteSymbol}
            baseLogoSize={28}
            quoteLogoSize={10}
            baseLogo={order?.tokenIcon}
            quoteLogo={CHAIN_INFO?.[Number(order?.chainId) as ChainId]?.logoUrl}
          />
          <Box className={'flex flex-col gap-[4px] text-[12px] leading-[1]'}>
            {isLoading ? (
              <Skeleton width={80} />
            ) : (
              <span className={'font-[500] text-white'}>
                m{order?.quoteSymbol}.{order?.baseSymbol} {t`Vault`}
              </span>
            )}
            <Box className={'text-secondary flex items-center gap-[4px]'}>
              {isLoading ? (
                <Skeleton width={80} />
              ) : (
                <>
                  <span>{order?.user ? encryptionAddress(order.user) : ''}</span>
                  <Copy content={order?.user} />
                </>
              )}
            </Box>
          </Box>
        </Box>
        {/* Status + Time */}
        <Box className={'flex flex-col items-end gap-[6px]'}>
          {isLoading ? (
            <Skeleton width={50} />
          ) : (
            <span
              className={`text-[12px] ${orderStatusColor[order?.orderStatus as LpOrderStatus]}`}
            >
              {orderStatusLabel[order?.orderStatus as LpOrderStatus]}
            </span>
          )}
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            <span className={'text-secondary text-[12px]'}>
              {dayjs((order?.txTime ?? 0) * 1000).format('YYYY/M/D HH:mm:ss')}
            </span>
          )}
        </Box>
      </Box>

      {/* Detail rows */}
      <Box className={'flex flex-col gap-[16px]'}>
        {/* Row 1: Type | Rate | Amount */}
        <Box className={'flex items-center justify-between'}>
          <Box className={'flex flex-col gap-[6px]'}>
            <span
              className={`text-[13px] font-[500] ${orderTypeColorMap[order?.orderType as LpOrderType]}`}
            >
              {isLoading ? (
                <Skeleton width={30} />
              ) : (
                orderTypeLabel[order?.orderType as LpOrderType]
              )}
            </span>
            <span className={'text-secondary text-[12px]'}>
              <Trans>Type</Trans>
            </span>
          </Box>
          <Box className={'flex flex-col gap-[6px]'}>
            <span className={'text-[13px] font-[500] text-white'}>
              {isLoading ? (
                <Skeleton width={60} />
              ) : (
                formatNumber(order?.price, { showUnit: false })
              )}
            </span>
            <span className={'text-secondary text-[12px]'}>
              <Trans>Price</Trans>
            </span>
          </Box>
          <Box className={'flex flex-col items-end gap-[6px]'}>
            <span className={'text-[13px] font-[500] text-white'}>
              {isLoading ? <Skeleton width={60} /> : formatNumber(order?.amount)}
            </span>
            <span className={'text-secondary text-[12px]'}>
              <Trans>Amount</Trans>
            </span>
          </Box>
        </Box>

        {/* Row 2: Hash */}
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary text-[12px]'}>
            <Trans>Hash</Trans>
          </span>
          <Box className={'flex items-center gap-[6px]'}>
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              <span
                className={'cursor-pointer text-[12px] font-[500] text-white underline'}
                onClick={() => {
                  if (explorerUrl && order?.txHash) {
                    window.open(`${explorerUrl}${order.txHash}`, '_blank')
                  }
                }}
              >
                {order?.txHash ? encryptionAddress(order.txHash, 8, 4) : '-'}
              </span>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
