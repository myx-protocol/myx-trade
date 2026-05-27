import { Box, Skeleton } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { LpOpenOrder } from '@/request/lp/type.ts'
import { getPoolOpenOrders } from '@/request'
import { PoolType, type Address } from '@/request/type.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { pool as Pool, TriggerType } from '@myx-trade/sdk'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { PairLogo } from '@/components/UI/PairLogo'
import type { ChainId } from '@/config/chain.ts'
import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy.tsx'
import { Empty } from '@/components/Empty.tsx'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { formatNumber } from '@/utils/number.ts'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { toast } from '@/components/UI/Toast'
import { WarningDialog } from '@/components/DialogBase/WarningDialog.tsx'
import { showErrorToast } from '@/config/error'
import { t } from '@lingui/core/macro'
import { PoolContext } from '@/pages/Earn/context.ts'

const limit = 20

const triggerTypeMap: Record<number, ReactNode> = {
  [TriggerType.GTE]: <Trans>TP</Trans>,
  [TriggerType.LTE]: <Trans>SL</Trans>,
}

const orderTypeColorMap: Record<number, string> = {
  [TriggerType.GTE]: 'text-[#00E3A5]',
  [TriggerType.LTE]: 'text-[#FF5C5C]',
}

export const OpenOrders = ({ showAll, chainId }: { showAll: boolean; chainId?: number }) => {
  const { accessToken } = useAccessToken()
  const { address: account } = useWalletConnection()
  const onAction = useWalletActions()
  const queryClient = useQueryClient()
  const { poolId } = useContext(PoolContext)

  const [list, setList] = useState<LpOpenOrder[]>([])
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [order, setOrder] = useState<LpOpenOrder | null>(null)

  const queryKey = [
    'getQuotePoolOpenOrders',
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
      const result = await getPoolOpenOrders(account as Address, accessToken || '', {
        chainId,
        poolType: PoolType.quote,
        limit: paginatedLimit,
        after: cursor,
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
      setCursor(list[list.length - 1].id)
    }
  }

  useEffect(() => {
    setCursor(undefined)
    setHasMore(true)
    setList([])
  }, [chainId, account, accessToken])

  const handleCancel = useCallback(async () => {
    if (!order) return
    try {
      const checked = await onAction(order.chainId)
      if (!checked) return
      await Pool.cancelTpSl({
        chainId: Number(order.chainId),
        orderId: order.orderId.toString(),
      })
      toast.success({ title: t`Successfully canceled the order.` })
      setCursor(undefined)
      setList([])
      setHasMore(true)
      await queryClient.invalidateQueries({ queryKey: ['getQuotePoolOpenOrders'] })
    } catch (error) {
      showErrorToast(error)
    }
  }, [onAction, queryClient, order])

  return (
    <>
      <Box className={'px-[16px]'}>
        <InfiniteScrollView
          dataLength={list.length}
          loadMore={loadMore}
          hasMore={hasMore}
          scrollableTarget={null}
        >
          <Box className={'flex flex-col'}>
            {(isLoading
              ? (Array.from({ length: 3 }).fill(null) as (LpOpenOrder | null)[])
              : list
            ).map((item, index) => (
              <OrderCard
                key={`${item?.orderId}-${item?.txHash || index}`}
                order={item}
                isLoading={isLoading && !item}
                onCancel={() => setOrder(item)}
              />
            ))}
            {!isLoading && list.length === 0 && <Empty />}
          </Box>
        </InfiniteScrollView>
      </Box>
      <WarningDialog
        tipTextClassName={'text-warning text-[16px] leading-[1.5] !mt-[0px]'}
        open={!!order}
        tipText={<Trans>Cancel this order?</Trans>}
        onClose={() => setOrder(null)}
        onConfirm={handleCancel}
      />
    </>
  )
}

const OrderCard = ({
  order,
  isLoading,
  onCancel,
}: {
  order: LpOpenOrder | null
  isLoading: boolean
  onCancel: (order: LpOpenOrder) => void
}) => {
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
        {/* Cancel */}
        <span
          className={'cursor-pointer text-[12px] text-white capitalize'}
          onClick={() => order && onCancel(order)}
        >
          {isLoading ? <Skeleton width={30} /> : <Trans>Cancel</Trans>}
        </span>
      </Box>

      {/* Row 1: Type | Trigger Rate | Amount */}
      <Box className={'flex items-center justify-between'}>
        <Box className={'flex flex-col gap-[6px]'}>
          <span
            className={`text-[13px] font-[500] ${order ? orderTypeColorMap?.[order.triggerType] : ''}`}
          >
            {isLoading || !order ? <Skeleton width={30} /> : triggerTypeMap[order.triggerType]}
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
              formatNumber(order?.triggerPrice, { showUnit: false })
            )}
          </span>
          <span className={'text-secondary text-[12px]'}>
            <Trans>Trigger Price</Trans>
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
    </Box>
  )
}
