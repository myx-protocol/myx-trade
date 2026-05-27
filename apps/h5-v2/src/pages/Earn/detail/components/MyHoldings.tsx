import { Box, Skeleton } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getACQuoteLpList } from '@/request'
import { type Address, PoolType } from '@/request/type'
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
  formatUnits,
  getBalanceOf,
  quote as Quote,
} from '@myx-trade/sdk'
import { formatNumber } from '@/utils/number'
import { calculationPnl } from '@/utils/pnl'
import type { PriceMapType, QuotePool } from '@/request/lp/type'
import { CHAIN_INFO } from '@/config/chainInfo'
import { PairLogo } from '@/components/UI/PairLogo'
import type { ChainId } from '@/config/chain'
import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy'
import { Empty } from '@/components/Empty'
import { useAccessParams } from '@/hooks/useAccessParams'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { usePoolSymbolsAll } from '@/hooks/pool/usePoolSymbolsAll'
import { useWalletActions } from '@/hooks/useWalletActions'
import { PoolContext } from '@/pages/Earn/context'
import { TPSLDialog } from '@/components/Dialog/TPSLDialog'
import { MIN_CLAIM_AMOUNT } from '@/constant/decimals'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { t } from '@lingui/core/macro'

export const MyHoldings = ({ showAll, chainId }: { showAll: boolean; chainId?: number }) => {
  const accessParams = useAccessParams()
  const { isWalletConnected } = useWalletConnection()
  const { poolId: currentPoolId } = useContext(PoolContext)
  const onAction = useWalletActions()

  const {
    data = { data: [] },
    isLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: [
      'myHoldingQuotePoolList',
      accessParams?.account,
      accessParams?.accessToken,
      showAll,
      currentPoolId,
      chainId,
    ],
    queryFn: async () => {
      if (!accessParams?.account) return { data: [] }
      const result = await getACQuoteLpList(
        accessParams.account as Address,
        accessParams.accessToken,
        {
          chainId,
          poolId: showAll ? undefined : currentPoolId,
          limit: 50,
        },
      )
      return { data: result.data || [] }
    },
    enabled: !!accessParams?.account,
  })

  const priceQueryParams = useMemo(
    () =>
      (data.data || []).map((item) => ({
        poolId: item.poolId,
        chainId: item.chainId,
        quotePoolToken: item.quotePoolToken,
      })),
    [data.data],
  )

  const { data: depositMap = {}, refetch: refetchDeposit } = useQuery<PriceMapType>({
    queryKey: ['myHoldingLpDeposit', priceQueryParams, accessParams?.account],
    enabled: !!priceQueryParams.length && !!accessParams?.account,
    queryFn: async () => {
      if (!priceQueryParams.length || !accessParams?.account) return {}
      const result = await Promise.allSettled(
        priceQueryParams.map(async (item) => {
          let balance = ''
          try {
            const bigintBalance = await getBalanceOf(
              item.chainId,
              accessParams!.account as Address,
              item.quotePoolToken,
            )
            balance = formatUnits(bigintBalance, COMMON_LP_AMOUNT_DECIMALS)
          } catch {
            /* ignore */
          }
          return { poolId: item.poolId, balance }
        }),
      )
      return result
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)
        .reduce((acc, cur) => ({ ...acc, [cur.poolId]: cur.balance }), {} as PriceMapType)
    },
  })

  const { data: priceMap = {}, refetch: refetchPrice } = useQuery<PriceMapType>({
    queryKey: ['myHoldingLpPrice', priceQueryParams, depositMap],
    enabled: !!priceQueryParams.length && !!Object.keys(depositMap).length,
    queryFn: async () => {
      if (!priceQueryParams.length || !Object.keys(depositMap).length) return {}
      const result = await Promise.allSettled(
        priceQueryParams
          .filter((item) => Number(depositMap?.[item.poolId]) > 0)
          .map(async (item) => {
            let price = ''
            try {
              const rs = await Quote.getLpPrice(item.chainId, item.poolId)
              if (rs) price = formatUnits(rs, COMMON_PRICE_DECIMALS)
            } catch {
              /* ignore */
            }
            return { poolId: item.poolId, price }
          }),
      )
      return result
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)
        .reduce((acc, cur) => ({ ...acc, [cur.poolId]: cur.price }), {} as PriceMapType)
    },
    refetchInterval: 5000,
  })

  const { symbolDataAllMap, isLoading: isLoadingPoolSymbolsAll } = usePoolSymbolsAll()

  const { data: rewardsMap = {}, refetch: refetchRewards } = useQuery<Record<string, string>>({
    queryKey: ['myHoldingRewards', data.data, accessParams?.account],
    enabled: !!data.data?.length && !!accessParams?.account && !isLoadingPoolSymbolsAll,
    queryFn: async () => {
      if (!data.data?.length || !accessParams?.account || !Object.keys(symbolDataAllMap).length)
        return {}
      const result = await Promise.allSettled(
        data.data.map(async (item) => {
          let rewards = ''
          const poolSymbol = symbolDataAllMap[item.chainId]?.[item.poolId]
          if (!poolSymbol) return { poolId: item.poolId, rewards: '0' }
          try {
            const rs = await Quote.getRewards({
              poolId: item.poolId,
              chainId: item.chainId,
              account: accessParams!.account as `0x${string}`,
            })
            if (rs === 0n) rewards = '0'
            else if (rs) rewards = formatUnits(rs, poolSymbol.quoteDecimals)
          } catch {
            /* ignore */
          }
          return { poolId: item.poolId, rewards }
        }),
      )
      return result
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)
        .reduce((acc, cur) => ({ ...acc, [cur.poolId]: cur.rewards }), {})
    },
    refetchInterval: 5000,
  })

  const pnlMap = useMemo(() => {
    if (!data?.data?.length) return {} as Record<string, string>
    return (data.data || [])
      .filter((item) => Number(depositMap?.[item.poolId]) > 0)
      .map((item) => {
        const price = priceMap?.[item.poolId]
        const avgPrice = item.avgLpPrice
        const lastTotal = depositMap?.[item.poolId]
        const pnl = price && avgPrice && lastTotal ? calculationPnl(price, avgPrice, lastTotal) : ''
        return { poolId: item.poolId, pnl }
      })
      .reduce((acc, cur) => ({ ...acc, [cur.poolId]: cur.pnl }), {} as Record<string, string>)
  }, [data.data, priceMap, depositMap])

  const dataList = useMemo(() => {
    if (!data.data?.length) return []
    return data.data.filter((item) => {
      const lastTotal = depositMap?.[item.poolId]
      return lastTotal && Number(lastTotal) > 0
    })
  }, [data.data, depositMap])

  // TPSL dialog state
  const [openTPSLDialog, setOpenTPSLDialog] = useState(false)
  const [tpslTarget, setTpslTarget] = useState<QuotePool | null>(null)
  const [claimingPoolId, setClaimingPoolId] = useState<string | null>(null)

  const handleTpsl = useCallback(
    async (row: QuotePool) => {
      const checked = await onAction(row.chainId)
      if (!checked) return
      setTpslTarget(row)
      setOpenTPSLDialog(true)
    },
    [onAction],
  )

  const handleClaim = useCallback(
    async (row: QuotePool) => {
      const reward = rewardsMap?.[row.poolId]
      if (!reward || Number(reward) < MIN_CLAIM_AMOUNT) return
      const checked = await onAction(row.chainId)
      if (!checked) return
      try {
        setClaimingPoolId(row.poolId)
        await Quote.claimQuotePoolRebate({ chainId: row.chainId, poolId: row.poolId })
        await refetchRewards()
      } catch {
        /* ignore */
      } finally {
        setClaimingPoolId(null)
      }
    },
    [rewardsMap, onAction, refetchRewards],
  )

  const isEmpty = !dataList.length || !isWalletConnected

  return (
    <Box className={'px-[16px]'}>
      <Box className={'flex flex-col'}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <HoldingCardSkeleton key={i} />)
        ) : isEmpty ? (
          <Empty />
        ) : (
          dataList.map((row) => (
            <HoldingCard
              key={row.poolId}
              row={row}
              depositMap={depositMap}
              priceMap={priceMap}
              pnlMap={pnlMap}
              rewardsMap={rewardsMap}
              claimingPoolId={claimingPoolId}
              onTpsl={handleTpsl}
              onClaim={handleClaim}
            />
          ))
        )}
      </Box>

      {tpslTarget && (
        <TPSLDialog
          open={openTPSLDialog}
          onClose={() => setOpenTPSLDialog(false)}
          poolId={tpslTarget.poolId}
          chainId={tpslTarget.chainId}
          poolType={PoolType.quote}
          amount={depositMap?.[tpslTarget.poolId] || '0'}
          baseSymbol={tpslTarget.baseSymbol}
          quoteSymbol={tpslTarget.quoteSymbol}
          costPrice={tpslTarget.avgLpPrice}
          poolName={tpslTarget.mQuoteBaseSymbol}
        />
      )}
    </Box>
  )
}

const HoldingCardSkeleton = () => (
  <Box className={'border-b-base flex flex-col gap-[20px] border-b py-[16px]'}>
    <Box className={'flex items-center justify-between'}>
      <Skeleton width={120} height={28} />
      <Skeleton width={80} height={20} />
    </Box>
    <Box className={'flex items-center justify-between'}>
      <Skeleton width={60} />
      <Skeleton width={80} />
      <Skeleton width={80} />
    </Box>
    <Box className={'flex items-center justify-between'}>
      <Skeleton width={100} />
      <Skeleton width={80} />
    </Box>
  </Box>
)

const HoldingCard = ({
  row,
  depositMap,
  priceMap,
  pnlMap,
  rewardsMap,
  claimingPoolId,
  onTpsl,
  onClaim,
}: {
  row: QuotePool
  depositMap: PriceMapType
  priceMap: PriceMapType
  pnlMap: Record<string, string>
  rewardsMap: Record<string, string>
  claimingPoolId: string | null
  onTpsl: (row: QuotePool) => void
  onClaim: (row: QuotePool) => void
}) => {
  const canClaim = rewardsMap?.[row.poolId] && Number(rewardsMap[row.poolId]) >= MIN_CLAIM_AMOUNT

  return (
    <Box className={'border-b-base flex flex-col gap-[20px] border-b py-[16px]'}>
      {/* Header: Logo + Name + Actions */}
      <Box className={'flex items-center justify-between'}>
        <Box className={'flex flex-1 items-center gap-[4px]'}>
          <PairLogo
            baseSymbol={row.mQuoteBaseSymbol}
            baseLogo={row.tokenIcon}
            quoteLogo={CHAIN_INFO?.[row.chainId as ChainId]?.logoUrl ?? ''}
            baseLogoSize={28}
            quoteLogoSize={10}
          />
          <Box className={'flex flex-col gap-[4px] text-[12px] leading-[1]'}>
            <span className={'font-[500] text-white'}>
              {row.mQuoteBaseSymbol} {t`Vault`}
            </span>
            <Box className={'text-secondary flex items-center gap-[8px]'}>
              <span>{row.symbolName}</span>
              <Box className={'flex items-center gap-[2px]'}>
                <span>{encryptionAddress(row.baseToken)}</span>
                <Copy content={row.baseToken} />
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Actions: TP/SL | Claim */}
        <Box className={'flex items-center gap-[16px]'}>
          <span
            className={'cursor-pointer text-[12px] text-white capitalize'}
            onClick={() => onTpsl(row)}
          >
            TP/SL
          </span>
          <span className={'h-[12px] w-[1px] bg-[#31333D]'} />
          <span
            className={`cursor-pointer text-[12px] text-white capitalize ${
              !canClaim ? 'pointer-events-none opacity-30' : ''
            } ${claimingPoolId === row.poolId ? 'pointer-events-none animate-pulse' : ''}`}
            onClick={() => onClaim(row)}
          >
            claim
          </span>
        </Box>
      </Box>

      {/* Row 1: APR | My Deposit | Unrealized PnL */}
      <Box className={'flex items-center justify-between'}>
        <Box className={'flex flex-col gap-[6px]'}>
          <span className={'text-[13px] font-[500] text-white'}>
            <RiseFallTextPrecent value={row.apr} />
          </span>
          <span className={'text-secondary text-[12px]'}>APR</span>
        </Box>
        <Box className={'flex flex-col gap-[6px]'}>
          <span className={'text-[13px] font-[500] text-white'}>
            {depositMap?.[row.poolId] ? `$${formatNumber(depositMap[row.poolId])}` : '0'}
          </span>
          <span className={'text-secondary text-[12px]'}>
            <Trans>My Deposit</Trans>
          </span>
        </Box>
        <Box className={'flex flex-col items-end gap-[6px]'}>
          <span className={'text-[13px] font-[500] text-white'}>
            {pnlMap?.[row.poolId] ? (
              <RiseFallText
                value={pnlMap[row.poolId]}
                renderOptions={{ showUnit: false, showSign: true }}
              />
            ) : (
              '--'
            )}
          </span>
          <span className={'text-secondary text-[12px]'}>
            <Trans>Unrealized PnL</Trans>
          </span>
        </Box>
      </Box>

      {/* Row 2: Unclaimed Fees */}
      <Box className={'flex items-center justify-between'}>
        <span className={'text-secondary text-[12px]'}>
          <Trans>Unclaimed Fees</Trans>
        </span>
        <span className={'text-[13px] font-[500] text-white'}>
          {rewardsMap?.[row.poolId] && Number(rewardsMap[row.poolId]) > 0
            ? `$${formatNumber(rewardsMap[row.poolId], { showUnit: false })}`
            : '0'}
        </span>
      </Box>
    </Box>
  )
}
