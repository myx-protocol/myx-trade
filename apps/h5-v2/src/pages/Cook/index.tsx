import { ToolBar } from '@/pages/Cook/components/ToolBar.tsx'
import { CookContext } from '@/pages/Cook/context.ts'
import { useState } from 'react'
import { CookListType, CookType, TrenchType } from '@/pages/Cook/type.ts'
import { Box } from '@mui/material'
import { TrenchTabBar } from '@/pages/Cook/components/TrenchTabBar.tsx'
import { TrenchTable } from '@/pages/Cook/components/TrenchTable.tsx'
import { ChainSelector } from '@/pages/Cook/components/ChainSelector.tsx'
import { IntervalSelector } from '@/pages/Cook/components/IntervalSelector.tsx'
import { Interval } from '@/request/type.ts'
import { SearchBar } from '@/components/SearchBar.tsx'
import { Banner } from '@/pages/Cook/components/Banner.tsx'
import { CookSubBar } from '@/pages/Cook/components/CookSubBar.tsx'
import { ChainsBar } from './components/ChainsBar'

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
    <>
      <SearchBar />
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
        </Box>
      </CookContext.Provider>
    </>
  )
}

export default Cook
