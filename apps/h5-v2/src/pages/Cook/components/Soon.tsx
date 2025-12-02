import { Card, CardTitle } from '@/pages/Cook/components/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { Token } from '@/pages/Cook/components/Token.tsx'
import Sun from '@/assets/icon/lp/sun.png'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'
import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getCookSoonList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookListType, CookType } from '@/pages/Cook/type.ts'
import dayjs from 'dayjs'
import { useCookFilter } from '@/pages/Cook/hook/useCookFilter.ts'
import { Empty } from '@/components/Empty.tsx'

export const Soon = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type, cookType } = useContext(CookContext)
  const {
    age,
    setAge,
    mc,
    setMC,
    progress,
    setProgress,
    change,
    setChange,
    liq,
    setLiq,
    holders,
    setHolders,
    count,
  } = useCookFilter()

  const { data = [], isLoading } = useQuery({
    queryKey: [
      { key: 'CookSoonList' },
      type,
      chainId,
      cookType,
      age,
      mc,
      progress,
      change,
      liq,
      holders,
    ],
    enabled: type === CookType.Cook && cookType === CookListType.Soon,
    queryFn: async () => {
      const result = await getCookSoonList({
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
                  key={item.poolId}
                  icon={item.tokenIcon}
                  address={item.baseToken}
                  label={item.symbol}
                  name={item.symbolName}
                  mc={item.marketCap}
                  liq={item.liquidity}
                  chainId={item.chainId}
                  holder={item.holders}
                  change={'0'}
                  time={item.tokenCreateTime}
                  progress={item.progress}
                  onClick={() => navigate(`/cook/${item.chainId}/${item.poolId}`)}
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
