import { Card, CardTitle } from '@/pages/Cook/components/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { Token } from '@/pages/Cook/components/Token.tsx'
import Sun from '@/assets/icon/lp/sun.png'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'
import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCookSoonList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookType } from '@/pages/Cook/type.ts'

export const Soon = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'CookSoonList' }, type, chainId],
    enabled: type === CookType.Cook,
    queryFn: async () => {
      const result = await getCookSoonList()
      console.log(result)
      return result?.data || []
    },
  })
  return (
    <>
      <Card className={'position flex h-fit flex-col'}>
        <CardTitle className={'sticky'} onFilter={() => setFiltersOpen(true)}>
          <Box className={'flex items-center gap-[4px]'}>
            <Box className={'h-[20px] w-[20px] min-w-[20px]'}>
              <img className={'block h-[20px] w-[20px]'} src={Sun} alt="New" />
            </Box>
            <Trans>Soon</Trans>
          </Box>
        </CardTitle>
        <Box className={'flex-1 overflow-y-auto'}>
          {isLoading
            ? Array.from({ length: 5 }).map((item, i) => <Token key={i} isLoading />)
            : (data || []).map((item) => {
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
              })}
        </Box>
      </Card>
      <DialogFilters open={filtersOpen} showCloseIcon onClose={() => setFiltersOpen(false)} />
    </>
  )
}
