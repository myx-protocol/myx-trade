import { Card, CardTitle } from '@/pages/Cook/components/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { Token } from '@/pages/Cook/components/Token.tsx'
import { Box } from '@mui/material'
import Star from '@/assets/icon/lp/star.png'
import { useContext, useState } from 'react'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'
import { useQuery } from '@tanstack/react-query'
import { getTokenSniperList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookType } from '@/pages/Cook/type.ts'

export const Sniper = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'TokenSniperList' }, type, chainId],
    enabled: type === CookType.Cook,
    queryFn: async () => {
      const result = await getTokenSniperList()
      console.log(result)
      return result?.data || []
    },
  })
  return (
    <>
      <Card className={'position flex h-min flex-col'}>
        <CardTitle className={'sticky'} onFilter={() => setFiltersOpen(true)}>
          <Box className={'flex items-center gap-[4px]'}>
            <Box className={'h-[20px] w-[20px] min-w-[20px]'}>
              <img className={'block h-[20px] w-[20px]'} src={Star} alt="New" />
            </Box>
            <Trans>Token Sniper</Trans>
          </Box>
        </CardTitle>
        <Box className={'flex-1 overflow-y-auto'}>
          {isLoading
            ? Array.from({ length: 5 }).map((item, i) => <Token key={i} isLoading />)
            : (data || []).map((item) => {
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
              })}
        </Box>
      </Card>
      <DialogFilters open={filtersOpen} showCloseIcon onClose={() => setFiltersOpen(false)} />
    </>
  )
}
