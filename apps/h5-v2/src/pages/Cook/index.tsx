import { CookContext } from '@/pages/Cook/context.ts'
import { useEffect, useState } from 'react'
import { CookListType, CookType } from '@/pages/Cook/type.ts'
import { Box } from '@mui/material'
import { t } from '@lingui/core/macro'
import { Banner } from '@/pages/Cook/components/Banner.tsx'
import { CookSubBar } from '@/pages/Cook/components/CookSubBar.tsx'
import { ChainsBar } from './components/ChainsBar'
import { CookTabs } from '@/pages/Cook/components/CookTabs.tsx'
import { SearchBar } from '@/components/SearchBar.tsx'
import { SearchTypeEnum } from '@myx-trade/sdk'

const Cook = () => {
  const [cookType, setCookType] = useState<CookListType>(CookListType.Sniper)
  const [chainId, setChainId] = useState<number | undefined>(undefined)

  const [age, setAge] = useState<[string, string]>(['', ''])
  const [mc, setMC] = useState<[string, string]>(['', ''])
  const [progress, setProgress] = useState<[string, string]>(['', ''])
  const [change, setChange] = useState<[string, string]>(['', ''])
  const [liq, setLiq] = useState<[string, string]>(['', ''])
  const [holders, setHolders] = useState<[string, string]>(['', ''])

  useEffect(() => {
    document.title = t`Cook - Build High-Yield Pools | MYX`
  }, [])

  return (
    <Box className={'h-[calc(100vh-var(--tabbar-height))] overflow-hidden'}>
      <Box
        id={'scrollView'}
        className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto"
      >
        <SearchBar defaultTab={SearchTypeEnum.Cook} />
        <Banner />
        <CookContext.Provider
          value={{
            type: CookType.Cook,
            setType: () => {},
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
            <CookSubBar className={'mt-[-4px]'} />
            <ChainsBar className={'mt-[4px]'} setChainId={setChainId} chainId={chainId} />
          </Box>
          <CookTabs chainId={chainId} />
        </CookContext.Provider>
      </Box>
    </Box>
  )
}

export default Cook
