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
import EmptyPng from '@/assets/images/common/empty.png'
import { t } from '@lingui/core/macro'
import { Interval, type SortOrder, type TrenchSortField } from '@/request/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { base as Base, COMMON_PRICE_DECIMALS, formatUnits } from '@myx-trade/sdk'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'

interface Data {
  market: Token
  price: string
  change: string
  apr: string
  tvl: string
  volume: string
  open: string
  chainId: number
  poolId: string
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
  // const [orderBy, setOrderBy] = useState<TrenchSortField>('priceChange')
  const [order, setOrder] = useState<SortOrder>('desc')
  const [before, setBefore] = useState<Trench['id'] | undefined>(undefined)
  const [after, setAfter] = useState<Trench['id'] | undefined>(undefined)

  // const handleSort = (property: keyof Data) => {
  //   const isAsc = orderBy === property && order === 'asc'
  //   setOrder(isAsc ? 'desc' : 'asc')
  //   setOrderBy(property)
  // }

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [{ key: 'TokenNewList' }, type, interval, chainId, sortField, order],
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
        before,
        after,
      })
      console.log(result)

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
          }
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
    queryKey: [{ key: 'getTrendLpAssetsBalance' }, priceQueryParams],
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

  useEffect(() => {
    setOrder('desc')
    setBefore(undefined)
    setAfter(undefined)
  }, [sortField])

  // const sortedRows = useMemo(() => {
  //   // return [...data.data].sort((a, b) => {
  //   //   const valA = orderBy === 'market' ? a.market.name : Number(a[orderBy])
  //   //   const valB = orderBy === 'market' ? b.market.name : Number(b[orderBy])
  //   //
  //   //   if (typeof valA === 'string' && typeof valB === 'string') {
  //   //     const result = valA.localeCompare(valB, 'en', { sensitivity: 'base' })
  //   //     return order === 'asc' ? result : -result
  //   //   }
  //   //
  //   //   if (valA < valB) return order === 'asc' ? -1 : 1
  //   //   if (valA > valB) return order === 'asc' ? 1 : -1
  //   //   return 0
  //   // })
  // }, [data, orderBy, order])

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
              {(data?.data || []).map((row, index) => (
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

                            setBefore(() => data.data?.[0]?.id)
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
                            setAfter(() => data.data?.[data.data?.length - 1]?.id)
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
                  <Box className={'flex flex-col items-center justify-center py-[100px]'}>
                    <img src={EmptyPng} alt="empty" className="h-[56px] w-[56px]" />
                    <div className="mt-[16px] leading-[1] font-medium text-[#848E9C] text-[12x]">{t`No results found`}</div>
                  </Box>
                </StyledTableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  )
}
