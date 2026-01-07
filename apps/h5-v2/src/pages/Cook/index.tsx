import { ToolBar } from '@/pages/Cook/components/ToolBar.tsx'
import { CookContext } from '@/pages/Cook/context.ts'
import { useState } from 'react'
import { CookListType, CookType, TrenchType } from '@/pages/Cook/type.ts'
import { Box } from '@mui/material'
import { TrenchTabBar } from '@/pages/Cook/components/TrenchTabBar.tsx'
import { Interval } from '@/request/type.ts'
import { SearchBar } from '@/components/SearchBar.tsx'
import { Banner } from '@/pages/Cook/components/Banner.tsx'
import { CookSubBar } from '@/pages/Cook/components/CookSubBar.tsx'
import { ChainsBar } from './components/ChainsBar'
import { CookTabs } from '@/pages/Cook/components/CookTabs.tsx'
import { TrenchSubBar } from '@/pages/Cook/components/TrenchSubBar.tsx'
import { IntervalList } from '@/pages/Cook/components/Interval.tsx'
import { ChainDropDownMenu } from '@/pages/Cook/components/ChainDropDownMenu.tsx'
import { TrenchList } from '@/pages/Cook/components/TrenchList.tsx'
import { SearchTypeEnum } from '@myx-trade/sdk'

const Cook = () => {
  const [type, setType] = useState<CookType>(CookType.Cook)
  const [cookType, setCookType] = useState<CookListType>(CookListType.Sniper)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [interval, setInterval] = useState<Interval | undefined>(Interval['10m'])
  const [trenchType, setTrenchType] = useState<TrenchType>(TrenchType.Latest)

  const [age, setAge] = useState<[string, string]>(['', ''])
  const [mc, setMC] = useState<[string, string]>(['', ''])
  const [progress, setProgress] = useState<[string, string]>(['', ''])
  const [change, setChange] = useState<[string, string]>(['', ''])
  const [liq, setLiq] = useState<[string, string]>(['', ''])
  const [holders, setHolders] = useState<[string, string]>(['', ''])

  return (
    <Box className={'overflow-x w-full pb-[var(--tabbar-height)]'}>
      <SearchBar defaultTab={SearchTypeEnum.Cook} />
      <Banner />
      <CookContext.Provider
        value={{
          type,
          setType,
          cookType,
          setCookType,
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
        }}
      >
        <Box className={'bg-deep sticky top-[0] z-[1]'}>
          <ToolBar />
          {type === CookType.Cook ? (
            <>
              <CookSubBar className={'mt-[-4px]'} />
              <ChainsBar className={'mt-[4px]'} setChainId={setChainId} chainId={chainId} />
            </>
          ) : (
            <>
              <TrenchTabBar
                className={'mt-[-4px]'}
                type={trenchType}
                onTypeChange={(_type) => setTrenchType(_type)}
              />

              <TrenchSubBar>
                <IntervalList interval={interval} setInterval={setInterval} />
                <ChainDropDownMenu setChainId={setChainId} chainId={chainId} />
              </TrenchSubBar>
            </>
          )}
        </Box>
        {type === CookType.Cook ? (
          <CookTabs chainId={chainId} />
        ) : (
          <TrenchList sortField={trenchType} interval={interval} chainId={chainId} />
        )}
      </CookContext.Provider>
    </Box>
  )
}

export default Cook
