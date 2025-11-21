import {
  Box,
  Button,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { Next, Prev, SortIcon } from '@/components/Icon'
import { type Token } from '@/pages/Cook/type.ts'
import { Copy } from '@/components/Copy.tsx'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getQuoteLpList } from '@/request'
import { getTimeDiff } from '@/utils/date.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { useNavigate } from 'react-router-dom'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { formatNumber } from '@/utils/number'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { TradeSide } from '@/pages/Earn/components/Trade/Context.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import EmptyPng from '@/assets/images/common/empty.png'
import { t } from '@lingui/core/macro'
import type { PriceMapType, QuotePool } from '@/request/lp/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import {
  COMMON_PRICE_DECIMALS,
  formatUnits,
  getBalanceOf,
  Market,
  quote as Quote,
} from '@myx-trade/sdk'
import { SearchContext } from '@/pages/Earn/context.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { type Address, PageDirection } from '@/request/type.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { calculationPnl } from '@/utils/pnl.ts'
import { Price } from '@/components/Price'
import { encodeSortValue } from '@/utils/sort.ts'

interface Vault {
  name: string
  icon: string
  rating: string
  apr: string
  tvl: number
  deposits: string
  pnl: string
  chainId: number
  address: string
  symbol: string
  time: number
  poolId: string
  id: number
  sortValue: any
  idx: number
  quotePoolToken: string
  avgLpPrice: string
}

enum SortField {
  apr = 'quoteApr',
  tvl = 'quoteTvl',
  time = 'tokenCreateTime',
  deposits = 'deposit',
  pnl = 'pnl',
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

const TokenInfo = ({ token }: { token: Token }) => {
  return (
    <Box className={'flex items-center gap-[10px]'}>
      <Box className={'relative h-[36px] w-[36px] min-w-[36px] rounded-full'}>
        <CoinIcon size={36} icon={token.icon ?? ''} symbol={token.name} />
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
          <span className={'bg-brand-10 rounded-[2px] px-[6px] py-[4px] text-[10px]'}>
            {token.rating}
          </span>
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

const TableLoading = () => {
  return Array.from({ length: 3 }).map((_, index) => (
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
    </StyledTableRow>
  ))
}

export const Vaults = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { accessToken } = useAccessToken()
  const { address: account } = useWalletConnection()
  const { chainId, interval } = useContext(SearchContext)
  const [orderBy, setOrderBy] = useState<SortField>(SortField.tvl)
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>(undefined)
  const [before, setBefore] = useState<string | undefined>(undefined)
  const [after, setAfter] = useState<string | undefined>(undefined)

  const handleSort = (property: SortField) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }
  const getSortValue = (item: QuotePool, sort: SortField) => {
    switch (sort) {
      case SortField.apr:
        return item.apr
      case SortField.time:
        return item.tokenCreateTime
      default:
        return item.tvl
    }
  }

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [
      { key: 'quotePoolList' },
      accessToken,
      chainId,
      interval,
      before,
      after,
      orderBy,
      order,
    ],
    enabled: !!accessToken,
    queryFn: async () => {
      if (!accessToken) return { data: [], hasNextPage: false, hasPrevPage: false }
      const limit = DEFAULT_LIMIT
      const paginatedLimit = limit + 1
      const sortField =
        orderBy === SortField.deposits || orderBy === SortField.pnl ? SortField.tvl : orderBy
      const result = await getQuoteLpList(accessToken, {
        timeInterval: interval,
        chainId: chainId,
        sortField,
        sortOrder: order,
        limit: paginatedLimit,
        direction: after ? PageDirection.Next : before ? PageDirection.Prev : undefined,
        cursor: after || before,
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
      return {
        data: (limit ? result.data.slice(0, limit) : result.data).map((quote, index) => {
          return {
            name: quote.symbolName,
            symbol: quote.mQuoteBaseSymbol,
            address: quote.baseToken,
            time: quote.tokenCreateTime,
            icon: quote.tokenIcon,
            rating: quote.rating,
            apr: quote.apr,
            tvl: Number(quote?.tvl),
            deposits: '',
            pnl: '',
            chainId: quote.chainId,
            poolId: quote.poolId,
            id: quote.id,
            idx: index,
            quotePoolToken: quote.quotePoolToken,
            avgLpPrice: quote.avgLpPrice,
            sortValue: getSortValue(quote, sortField),
          } as Vault
        }),
        hasNextPage,
        hasPrevPage,
      }
    },
  })

  const priceQueryParams = useMemo(() => {
    return (data.data || []).map((item) => ({
      poolId: item.poolId,
      chainId: item.chainId,
      idx: item.idx,
      quotePoolToken: item.quotePoolToken,
    }))
  }, [data.data])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getVaultsLpAssetPrice' }, priceQueryParams],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let _price = ''
          try {
            const rs = await Quote.getLpPrice(item.chainId, item.poolId)
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

  const { data: depositMap } = useQuery({
    queryKey: [{ key: 'getVaultsLpDeposit' }, priceQueryParams, account],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let balance = ''
          try {
            const bigintBalance = await getBalanceOf(
              item.chainId,
              account as Address,
              item?.quotePoolToken,
            )
            balance = formatUnits(bigintBalance, Market[item.chainId].lpDecimals)
            console.log(balance)
          } catch (_e) {
            console.error(_e)
          }
          return {
            idx: item.idx,
            poolId: item.poolId,
            chainId: item.chainId,
            balance: balance,
          }
        }),
      )

      const map = (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.balance,
        }
      }, {} as PriceMapType)
      return map
    },
    // refetchInterval: 5000,
  })

  const pnlMap: Record<string, string> = useMemo(() => {
    if (!data?.data?.length) return {}
    return (data.data || [])
      .map((item) => {
        const price = priceMap?.[item.poolId]
        const avgPrice = item.avgLpPrice
        const lastTotal = depositMap?.[item.poolId]

        return {
          poolId: item.poolId,
          pnl: price && avgPrice && lastTotal ? calculationPnl(price, avgPrice, lastTotal) : '',
        }
      })
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.pnl,
        }
      }, {})
  }, [data.data, priceMap, depositMap])
  const sortedRows = useMemo(() => {
    if (!(orderBy === SortField.deposits || orderBy === SortField.pnl)) {
      return data.data
    }
    return [...data.data].sort((a, b) => {
      const valA = orderBy === SortField.deposits ? depositMap?.[a.poolId] : pnlMap?.[a.poolId]
      const valB = orderBy === SortField.deposits ? depositMap?.[b.poolId] : pnlMap?.[b.poolId]

      if (typeof valA === 'string' && typeof valB === 'string') {
        const result = valA.localeCompare(valB, 'en', { sensitivity: 'base' })
        return order === 'asc' ? result : -result
      }

      if (valA && valB && valA < valB) return order === 'asc' ? -1 : 1
      if (valA && valB && valA > valB) return order === 'asc' ? 1 : -1
      return 0
    })
  }, [data, orderBy, order, depositMap])

  return (
    <StyledTableContainer className={`${className}`}>
      <Table stickyHeader className={'w-full table-fixed'}>
        <TableHead>
          <TableRow>
            <StyledTableCell className={'w-1/6 overflow-hidden'}>
              <TableSortLabel onClick={() => handleSort(SortField.time)} hideSortIcon>
                <span className="text-third flex items-center gap-1">
                  <Trans>Vault</Trans>
                  <SortIcon
                    className={`text-third transition-color ${
                      orderBy === SortField.time && order ? order : ''
                    }`}
                    size={10}
                  />
                </span>
              </TableSortLabel>
            </StyledTableCell>

            <StyledTableCell align={'right'} className={'w-1/6 overflow-hidden'}>
              <TableSortLabel onClick={() => handleSort(SortField.apr)} hideSortIcon>
                <span className="text-third flex items-center gap-1">
                  <Trans>APR</Trans>
                  <SortIcon
                    className={`text-third transition-color ${
                      orderBy === SortField.apr && order ? order : ''
                    }`}
                    size={10}
                  />
                </span>
              </TableSortLabel>
            </StyledTableCell>

            <StyledTableCell align={'right'} className={'w-1/6 overflow-hidden'}>
              <TableSortLabel onClick={() => handleSort(SortField.tvl)} hideSortIcon>
                <span className="text-third flex items-center gap-1">
                  <Trans>TVL</Trans>
                  <SortIcon
                    className={`text-third transition-color ${
                      orderBy === SortField.tvl && order ? order : ''
                    }`}
                    size={10}
                  />
                </span>
              </TableSortLabel>
            </StyledTableCell>

            <StyledTableCell align={'right'} className={'w-1/6 overflow-hidden'}>
              <TableSortLabel onClick={() => handleSort(SortField.deposits)} hideSortIcon>
                <span className="text-third flex items-center gap-1">
                  <Trans>My Deposits</Trans>
                  <SortIcon
                    className={`text-third transition-color ${
                      orderBy === SortField.deposits && order ? order : ''
                    }`}
                    size={10}
                  />
                </span>
              </TableSortLabel>
            </StyledTableCell>

            <StyledTableCell align={'right'} className={'w-1/6 overflow-hidden'}>
              <TableSortLabel onClick={() => handleSort(SortField.pnl)} hideSortIcon>
                <span className="text-third flex items-center gap-1">
                  <Trans>My PnL</Trans>
                  <SortIcon
                    className={`text-third transition-color ${
                      orderBy === SortField.pnl && order ? order : ''
                    }`}
                    size={10}
                  />
                </span>
              </TableSortLabel>
            </StyledTableCell>

            <StyledTableCell align={'right'} className={'w-1/6 overflow-hidden'}>
              <Trans>Actions</Trans>
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
              {sortedRows.map((row, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>
                    <TokenInfo
                      token={
                        {
                          icon: row.icon,
                          name: row.symbol,
                          chainId: row.chainId,
                          address: row.address,
                          time: row.time,
                          rating: row.rating,
                          label: row.name,
                        } as Token
                      }
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <span className={Number(row?.apr) > 0 ? 'text-rise' : 'text-fall'}>
                      {formatNumberPercent(row?.apr)}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.tvl ? formatNumber(row.tvl) : '--'}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <span>
                      $
                      {formatNumberPrecision(
                        depositMap?.[row?.poolId],
                        COMMON_BASE_DISPLAY_DECIMALS,
                      )}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <span
                      className={
                        Number(pnlMap?.[row.poolId]) > 0
                          ? 'text-rise'
                          : Number(pnlMap?.[row.poolId]) < 0
                            ? 'text-fall'
                            : ''
                      }
                    >
                      ${formatNumberPrecision(pnlMap?.[row.poolId], COMMON_BASE_DISPLAY_DECIMALS)}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box className={'flex items-center justify-end gap-[12px]'}>
                      <Button
                        variant="text"
                        className={'!min-w-[auto] !p-[0]'}
                        disableRipple
                        onClick={() =>
                          navigate(`/earn/${row.chainId}/${row.poolId}?side=${TradeSide.Subscribe}`)
                        }
                      >
                        <Trans>申购</Trans>
                      </Button>
                      <Button
                        variant="text"
                        className={'!min-w-[auto] !p-[0]'}
                        disableRipple
                        onClick={() =>
                          navigate(`/earn/${row.chainId}/${row.poolId}?side=${TradeSide.Redeem}`)
                        }
                      >
                        <Trans>赎回</Trans>
                      </Button>
                      {/* <Button variant="text" className={'!min-w-[auto] !p-[0]'} disableRipple>
                    <Trans>Transfer</Trans>
                  </Button>*/}
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {!!sortedRows?.length && (
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

          {!isLoading && sortedRows.length === 0 && (
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
