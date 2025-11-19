import { Card, CardTitle } from '@/pages/Cook/components/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag.tsx'
import { Box } from '@mui/material'
import { Token } from '@/pages/Cook/components/Token.tsx'
import Leaf from '@/assets/icon/lp/leaf.png'
import { useContext, useState } from 'react'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'
import { useQuery } from '@tanstack/react-query'
import { getCookNews } from '@/request'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookType } from '@/pages/Cook/type.ts'
import { Pause } from '@/components/Icon'

export const New = ({ chainId }: { chainId?: number }) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'TokenNewList' }, type, chainId],
    enabled: type === CookType.Cook,
    queryFn: async () => {
      const result = await getCookNews()
      console.log(result)
      return result?.data || []
    },
  })

  return (
    <>
      <Card className={'position flex h-min flex-col'}>
        <CardTitle className={'sticky flex items-center'} onFilter={() => setFiltersOpen(true)}>
          <Box className={'flex items-center gap-[8px]'}>
            <Box className={'flex items-center gap-[4px]'}>
              <Box className={'h-[20px] w-[20px] min-w-[20px]'}>
                <img className={'block h-[20px] w-[20px]'} src={Leaf} alt="New" />
              </Box>
              <Trans>NEW</Trans>
            </Box>

            <Tag type={'warning'}>
              <Pause size={11} />
              <Trans>Paused</Trans>
            </Tag>
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
