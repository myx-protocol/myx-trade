import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getQuoteLpList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { SearchContext } from '@/pages/Earn/context.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { PageDirection } from '@/request/type.ts'
import { Change } from '@/components/Change'
import { Empty } from '@/components/Empty.tsx'
import { SortField, type Vault } from '@/pages/Earn/type.ts'
import { Token } from './Token'

export const Vaults = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { accessToken } = useAccessToken()
  const { chainId, interval } = useContext(SearchContext)
  const [before, setBefore] = useState<string | undefined>(undefined)
  const [after, setAfter] = useState<string | undefined>(undefined)

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [{ key: 'quotePoolList' }, accessToken, chainId, interval, before, after],
    enabled: !!accessToken,
    queryFn: async () => {
      if (!accessToken) return { data: [], hasNextPage: false, hasPrevPage: false }
      const limit = DEFAULT_LIMIT
      const paginatedLimit = limit + 1
      const sortField = SortField.tvl
      const result = await getQuoteLpList(accessToken, {
        timeInterval: interval,
        chainId: chainId,
        sortField,
        sortOrder: 'desc',
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
          } as Vault
        }),
        hasNextPage,
        hasPrevPage,
      }
    },
  })

  return (
    <Box className={'flex flex-col'}>
      <Box>
        {(isLoading ? (Array.from({ length: 3 }).fill(null) as Vault[]) : data?.data || []).map(
          (item, index) => {
            return (
              <Box
                className={
                  'border-base flex items-center justify-between border-b-1 px-[16px] py-[20px]'
                }
                onClick={() => {
                  if (item) {
                    navigate(`/earn/${item.chainId}/${item.poolId}`)
                  }
                }}
              >
                <Token token={item} />
                <Box className={'flex flex-col items-end gap-[4px]'}>
                  <Box className={'text-[14px] leading-[1] font-[500] text-white'}>
                    {!item ? (
                      <Skeleton width={95} />
                    ) : (
                      <>${formatNumberPrecision(item.tvl, COMMON_BASE_DISPLAY_DECIMALS)}</>
                    )}
                  </Box>

                  <Box className={'text-[12px] leading-[1] font-[500] text-white'}>
                    {!item ? (
                      <Skeleton width={60} />
                    ) : (
                      <Change change={item.apr} className={'text-secondary'}>
                        {formatNumberPercent(item.apr)}
                      </Change>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          },
        )}
        {!isLoading && data?.data?.length === 0 && (
          <Box>
            <Empty />
          </Box>
        )}
      </Box>
    </Box>
  )
}
