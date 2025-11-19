import { ToolBar } from '@/pages/Cook/components/ToolBar.tsx'
import { CookContext } from '@/pages/Cook/context.ts'
import { useState } from 'react'
import { CookType, TrenchType } from '@/pages/Cook/type.ts'
import { Box } from '@mui/material'
import { Sniper } from '@/pages/Cook/components/Sniper.tsx'
import { New } from '@/pages/Cook/components/New.tsx'
import { Soon } from '@/pages/Cook/components/Soon.tsx'
import { TrenchTabBar } from '@/pages/Cook/components/TrenchTabBar.tsx'
import { TrenchTable } from '@/pages/Cook/components/TrenchTable.tsx'
import { ChainSelector } from '@/pages/Cook/components/ChainSelector.tsx'
import { IntervalSelector } from '@/pages/Cook/components/IntervalSelector.tsx'
import { Interval, TrenchSortField } from '@/request/type.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'

const Cook = () => {
  const { chainId: curChainId } = useWalletConnection()
  const [type, setType] = useState<CookType>(CookType.Cook)
  const [chainId, setChainId] = useState<number | undefined>(curChainId ?? undefined)
  const [interval, setInterval] = useState<Interval | undefined>(Interval['10m'])
  const [trenchType, setTrenchType] = useState<TrenchType>(TrenchType.Latest)
  // const { data = null } = useQuery({
  //   queryKey: [{ key: 'PoolOpenOrders' }, chainId],
  //   queryFn: async () => {
  //     const result = await Pool.getOpenOrders(chainId)
  //     console.log(result)
  //     return result
  //   },
  // })
  return (
    <CookContext.Provider value={{ type, setType }}>
      <ToolBar>
        {type === CookType.Cook ? (
          <ChainSelector chainId={chainId} setChainId={(id) => setChainId(id)} />
        ) : (
          <></>
        )}
      </ToolBar>
      {type === CookType.Cook ? (
        <Box className={'relative z-[1] grid grid-cols-3 gap-[4px] px-[12px]'}>
          <Sniper />
          <New />
          <Soon />
        </Box>
      ) : (
        <>
          <TrenchTabBar type={trenchType} onTypeChange={(_type) => setTrenchType(_type)}>
            <Box className={'flex items-center gap-[12px]'}>
              <IntervalSelector
                interval={interval}
                setInterval={(_value) => setInterval(_value as Interval)}
              />
              <ChainSelector chainId={chainId} setChainId={(id) => setChainId(id)} />
            </Box>
          </TrenchTabBar>
          <Box className={'bg-deep sticky top-[186px] w-full px-[24px]'}>
            <TrenchTable sortField={trenchType} interval={interval} chainId={chainId} />
          </Box>
        </>
      )}
    </CookContext.Provider>
  )
}

export default Cook
