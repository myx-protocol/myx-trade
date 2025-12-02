import { Card } from '@/pages/Cook/components/Card.tsx'
import { Token } from '@/pages/Cook/components/Token.tsx'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getTokenSniperList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookListType, CookType } from '@/pages/Cook/type.ts'
import { useCookFilter } from '@/pages/Cook/hook/useCookFilter.ts'
import dayjs from 'dayjs'
import { Empty } from '@/components/Empty.tsx'

export const Sniper = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type, cookType } = useContext(CookContext)
  const { age, mc, progress, change, liq, holders } = useCookFilter()

  const { data = [], isLoading } = useQuery({
    queryKey: [
      { key: 'TokenSniperList' },
      type,
      cookType,
      chainId,
      age,
      mc,
      progress,
      change,
      liq,
      holders,
    ],
    enabled: type === CookType.Cook && cookType === CookListType.Sniper,
    queryFn: async () => {
      const result = await getTokenSniperList({
        chainId,
        limit: DEFAULT_LIMIT,
        sortOrder: 'desc',
        marketCapMin: mc?.[0] || undefined,
        marketCapMax: mc?.[1] || undefined,
        priceChangeMin: change?.[0] || undefined,
        priceChangeMax: change?.[1] || undefined,
        tokenCreateTimeMin: age?.[1] ? dayjs().subtract(Number(age[1]), 'm').unix() : undefined,
        tokenCreateTimeMax: age?.[0] ? dayjs().subtract(Number(age[0]), 'm').unix() : undefined,
        holdersMin: holders[0] || undefined,
        holdersMax: holders[1] || undefined,
      })
      console.log(result)
      return result?.data || []
    },
  })
  return (
    <>
      <Card className={'position flex flex-col'}>
        <Box className={'flex-1 overflow-y-auto'}>
          {isLoading ? (
            Array.from({ length: 5 }).map((item, i) => <Token key={i} isLoading />)
          ) : data?.length > 0 ? (
            (data || []).map((item) => {
              return (
                <Token
                  key={item.tokenAddress}
                  icon={item.tokenIcon}
                  address={item.tokenAddress}
                  label={item.symbol}
                  name={item.symbolName}
                  mc={item.marketCap}
                  liq={item.liquidity}
                  chainId={item.chainId}
                  holder={item.holders}
                  change={item.priceChange}
                  time={item.tokenCreateTime}
                  onClick={() => navigate(`/market/${item.chainId}/${item.tokenAddress}`)}
                />
              )
            })
          ) : (
            <Empty />
          )}
        </Box>
      </Card>
    </>
  )
}
