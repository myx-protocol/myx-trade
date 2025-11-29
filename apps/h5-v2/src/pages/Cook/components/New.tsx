import { Card, CardTitle } from '@/pages/Cook/components/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag.tsx'
import { Box } from '@mui/material'
import { Token } from '@/pages/Cook/components/Token.tsx'
import Leaf from '@/assets/icon/lp/leaf.png'
import { useContext, useState } from 'react'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getCookNews } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookType } from '@/pages/Cook/type.ts'
import { Pause } from '@/components/Icon'
import { useCookFilter } from '@/pages/Cook/hook/useCookFilter.ts'
import dayjs from 'dayjs'
import { Empty } from '@/components/Empty.tsx'

export const New = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const { age, mc, progress, change, liq, holders } = useCookFilter()

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'TokenNewList' }, type, chainId, age, mc, progress, change, liq, holders],
    enabled: type === CookType.Cook,
    queryFn: async () => {
      const result = await getCookNews({
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
      // console.log(result)
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
