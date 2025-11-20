import { useContext, useEffect, useMemo, useState } from 'react'
import {
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Next, Prev } from '@/components/Icon'
import { CookType, type Token, TrenchType } from '@/pages/Cook/type.ts'
import { Trans } from '@lingui/react/macro'
import Box from '@mui/material/Box'
import { Copy } from '@/components/Copy.tsx'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getTrenchList } from '@/request'
import type { PriceMapType, Trench } from '@/request/lp/type.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { getTimeDiff } from '@/utils/date.ts'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { formatNumber } from '@/utils/number.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import {
  type Address,
  Interval,
  PageDirection,
  type SortOrder,
  type TrenchSortField,
} from '@/request/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { base as Base, COMMON_PRICE_DECIMALS, formatUnits, getBalanceOf } from '@myx-trade/sdk'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Empty } from '@/components/Empty.tsx'
import { encodeSortValue } from '@/utils/sort.ts'
import { Price } from '@/components/Price'

interface Data {
  id: number | string
  market: Token
  price: string
  change: string
  apr: string
  tvl: string
  volume: string
  open: string
  chainId: number
  poolId: string
  sortValue: string
}

const StyledTableContainer = styled(TableContainer)(() => ({
  backgroundColor: 'var(--deep-bg)',
  borderRadius: '12px',
  border: 'none',
}))

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--deep-bg)',
    color: 'var(--color-third)',
    fontSize: 12,
    borderBottom: '1px solid var(--color-base)',
    padding: '12px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontWeight: '500',
    color: 'var(--basic-white)',
    borderColor: 'var(--color-base)',
    padding: '20px 12px',
    '&.empty': {
      border: 0,
    },
  },
}))

const StyledTableRow = styled(TableRow)(() => ({
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: 'var(--base-bg)', // 你的自定义变量或颜色
  },
}))

const TableLoading = () => {
  return Array.from({ length: 50 }).map((_, index) => (
    <StyledTableRow className={'pointer-events-none'} key={index}>
      <StyledTableCell>
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
      <StyledTableCell align="right">
        <Skeleton />
      </StyledTableCell>
    </StyledTableRow>
  ))
}

const TokenInfo = ({ token }: { token: Token }) => {
  return (
    <Box className={'flex items-center gap-[10px]'}>
      <Box className={'relative h-[36px] w-[36px] min-w-[36px] rounded-full'}>
        <CoinIcon size={36} icon={token?.icon ?? ''} />
        <Box
          className={'rounded-2px absolute right-[-4px] bottom-0 h-[12px] w-[12px] bg-[#282C34]'}
        >
          <CoinIcon size={12} icon={CHAIN_INFO?.[token?.chainId]?.logoUrl ?? ''} />
        </Box>
      </Box>
      <Box className={'flex flex-col gap-[6px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px]'}>
          <h3 className={'text-[16px] font-[500] text-white'}>{token?.name || '--'}</h3>
          <span className={'text-secondary'}>{token?.label || '--'}</span>
        </Box>
        <Box className={'flex items-center gap-[6px] text-[12px]'}>
          <span className={'text-regular'}> {getTimeDiff(token?.time as number)}</span>
          <Box className={'text-secondary flex items-center gap-[4px]'}>
            <span className={''}>{token?.address ? encryptionAddress(token?.address) : '--'}</span>
            <Copy content={token?.address || '--'} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export const TrenchTable = ({
  sortField,
  interval,
  chainId,
}: {
  sortField: TrenchType
  interval?: Interval
  chainId?: number
}) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const { address: account } = useWalletConnection()
  const [order, setOrder] = useState<SortOrder>('desc')
  const [before, setBefore] = useState<string | undefined>(undefined)
  const [after, setAfter] = useState<string | undefined>(undefined)

  const getSortValue = (item: Trench) => {
    switch (sortField) {
      case TrenchType.Gainers:
        return item.lpPriceChange
      case TrenchType.Latest:
        return item.tokenCreateTime
      case TrenchType.APR:
        return item.apr
      case TrenchType.Eligible:
        return item.tvl
    }
  }

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [
      { key: 'TokenNewList' },
      type,
      interval,
      chainId,
      sortField,
      order,
      account,
      before,
      after,
    ],
    enabled: type === CookType.Trench,
    queryFn: async () => {
      const limit = DEFAULT_LIMIT
      const paginatedLimit = limit + 1
      const result = await getTrenchList({
        timeInterval: interval || undefined,
        chainId: chainId || undefined,
        sortField: sortField as unknown as TrenchSortField,
        sortOrder: order,
        limit: paginatedLimit,
        direction: before ? PageDirection.Prev : after ? PageDirection.Next : undefined,
        cursor: before || after,
      })

      let hasNextPage = true
      let hasPrevPage = true
      if (paginatedLimit) {
        const hasNoMoreData = (result.data || []).length < paginatedLimit

        if (!after && !before) {
          hasPrevPage = false
          if (hasNoMoreData) {
            hasNextPage = false
          }
        } else if (after && hasNoMoreData) {
          hasNextPage = false
        } else if (before && hasNoMoreData) {
          hasPrevPage = false
        }
      }

      const paginatedData = {
        data: (limit ? result.data.slice(0, limit) : result.data).map((item: Trench) => {
          return {
            id: item.id,
            sortValue: getSortValue(item),
            market: {
              icon: item.tokenIcon,
              name: item.mBaseQuoteSymbol,
              label: item.mSymbol,
              chainId: item.chainId,
              address: item.baseToken,
              time: item.tokenCreateTime,
            },
            price: '',
            change: item.lpPriceChange,
            apr: item.apr,
            tvl: item.tvl,
            volume: item.volume,
            open: item.oi,
            chainId: item.chainId,
            poolId: item.poolId,
          } as Data
        }),
        hasNextPage,
        hasPrevPage,
      }

      return paginatedData
    },
    refetchOnWindowFocus: true, // 默认 true
    refetchOnMount: true, // 组件重新挂载时刷新
    refetchOnReconnect: true, // 网络恢复时刷新
  })

  const priceQueryParams = useMemo(() => {
    return (data.data || []).map((item) => ({ poolId: item.poolId, chainId: item.chainId }))
  }, [data.data])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getTrendLpAssetsPrice' }, priceQueryParams],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let _price = ''
          try {
            const rs = await Base.getLpPrice(item.chainId, item.poolId)
            if (rs) {
              _price = formatUnits(rs, COMMON_PRICE_DECIMALS)
            }
          } catch (_e) {
            console.error(_e)
          }
          return {
            poolId: item.poolId,
            chainId: item.chainId,
            price: _price,
          }
        }),
      )

      const map = (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.price,
        }
      }, {} as PriceMapType)
      return map
    },
    refetchInterval: 5000,
  })

  const { data: valueMap } = useQuery({
    queryKey: [{ key: 'getTrendLpAssetsBalance' }, priceQueryParams, account, sortField],
    queryFn: async () => {
      if (sortField !== TrenchType.Eligible) return {} as PriceMapType
      const balances = await Promise.all(
        (data.data || []).map(async (item) => {
          let balance = ''
          try {
            // 更改为 mobula 的价值
            const _balance = await getBalanceOf(
              item.chainId,
              account as Address,
              item.market.address,
            )
            balance = formatUnits(_balance, 6) //item.baseDecimals
          } catch (_e) {
            console.error(_e)
          }
          return {
            poolId: item.poolId,
            balance,
          }
        }),
      )
      const map = (balances || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.balance,
        } as PriceMapType
      }, {} as PriceMapType)
      return map
    },
  })

  useEffect(() => {
    setOrder('desc')
    setBefore(undefined)
    setAfter(undefined)
  }, [sortField])

  const sortedRows = useMemo(() => {
    if (!data?.data?.length) return data?.data
    if (!(account && sortField === TrenchType.Eligible)) return data?.data
    return [...(data?.data || [])].sort(
      (a, b) => Number(valueMap?.[b.poolId]) - Number(valueMap?.[a.poolId]) || 0,
    )
  }, [data.data])

  return (
    <StyledTableContainer className="max-h-[calc(100vh-186px)]">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>
              {/*<TableSortLabel onClick={() => handleSort('market')} hideSortIcon>*/}
              <span className="text-third flex items-center gap-1">
                <Trans>Markets</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'market' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel*/}
              {/*  // active={orderBy === 'price'}*/}
              {/*  onClick={() => handleSort('price')}*/}
              {/*  hideSortIcon*/}
              {/*>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>Price</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'price' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel onClick={() => handleSort('change')} hideSortIcon>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>Change</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'change' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel onClick={() => handleSort('apr')} hideSortIcon>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>APR</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'apr' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel onClick={() => handleSort('tvl')} hideSortIcon>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>TVL</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'tvl' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel onClick={() => handleSort('volume')} hideSortIcon>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>Perp Volume</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'volume' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
            <StyledTableCell align="right">
              {/*<TableSortLabel onClick={() => handleSort('open')} hideSortIcon>*/}
              <span className="text-third flex items-center justify-end gap-1">
                <Trans>Open Interest</Trans>
                {/*<SortIcon*/}
                {/*  className={`text-third transition-color ${*/}
                {/*    orderBy === 'open' && order ? order : ''*/}
                {/*  }`}*/}
                {/*  size={10}*/}
                {/*/>*/}
              </span>
              {/*</TableSortLabel>*/}
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={999} sx={{ height: 4, padding: 0, border: 'none' }} />
          </TableRow>
          {isLoading ? (
            <TableLoading />
          ) : (
            <>
              {(sortedRows || []).map((row, index) => (
                <StyledTableRow
                  className="cursor-pointer"
                  key={index}
                  onClick={() => navigate(`/cook/${row.chainId}/${row.poolId}`)}
                >
                  <StyledTableCell>
                    <TokenInfo token={row.market} />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    ${formatNumberPrecision(priceMap?.[row.poolId], COMMON_PRICE_DISPLAY_DECIMALS)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <span className={Number(row.change) > 0 ? 'text-rise' : 'text-fall'}>
                      {formatNumberPercent(row?.change)}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <span className={Number(row.apr) > 0 ? 'text-rise' : 'text-fall'}>
                      {formatNumberPercent(row?.apr)}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">{formatNumber(row?.tvl)}</StyledTableCell>
                  <StyledTableCell align="right">
                    {row?.volume ? formatNumber(row.volume) : '--'}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row?.open ? formatNumber(row.open) : '--'}
                  </StyledTableCell>
                </StyledTableRow>
              ))}

              {!!data?.data?.length && (
                <>
                  <TableRow>
                    <TableCell colSpan={999} sx={{ height: 12, padding: 0, border: 'none' }} />
                  </TableRow>
                  <TableRow className={''}>
                    <StyledTableCell className={'empty'} colSpan={999}>
                      <Box className={'flex h-[20px] items-center justify-end gap-x-[32px]'}>
                        <Prev
                          size={14}
                          className={` ${data.hasPrevPage ? 'text-secondary cursor-pointer' : 'text-third cursor-not-allowed'} `}
                          onClick={() => {
                            if (isLoading || !data.hasPrevPage) return

                            setBefore(() => encodeSortValue(data.data?.[0]))
                            setAfter(() => undefined)
                          }}
                        />
                        <Next
                          size={14}
                          className={
                            isLoading || !data.hasNextPage
                              ? 'text-third cursor-not-allowed'
                              : 'text-regular cursor-pointer'
                          }
                          onClick={() => {
                            if (isLoading || !data.hasNextPage) return

                            setBefore(() => undefined)
                            setAfter(() => encodeSortValue(data.data?.[data.data?.length - 1]))
                          }}
                        />
                      </Box>
                    </StyledTableCell>
                  </TableRow>
                </>
              )}
            </>
          )}
          {!isLoading && data?.data?.length === 0 && (
            <>
              <TableRow>
                <StyledTableCell className={'empty'} colSpan={999}>
                  <Empty />
                </StyledTableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  )
}
