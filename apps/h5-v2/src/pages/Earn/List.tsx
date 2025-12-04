import Container from '@/components/Container.tsx'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { Carousel } from '@/pages/Earn/components/Carousel.tsx'
import { ToolBar } from '@/pages/Earn/components/ToolBar.tsx'
import { Dashboard } from './components/Dashboard'
import { Vaults } from '@/pages/Earn/components/Vaults.tsx'
import { SearchContext } from '@/pages/Earn/context.ts'
import { useState } from 'react'
import { Interval } from '@/request/type.ts'
import { SearchBar } from '@/components/SearchBar.tsx'

const EarnList = () => {
  const [chainId, setChainId] = useState<number>()
  const [interval, setInterval] = useState<Interval>()
  return (
    <Box className="overflow-x w-full pb-[var(--tabbar-height)]">
      <SearchBar />
      <Box className={'mt-[48px] h-[172px]'}>
        <Carousel />
      </Box>
      <SearchContext.Provider value={{ chainId, setChainId, interval, setInterval }}>
        <ToolBar />
        <Dashboard />
        <Vaults className={'mt-[24px]'} />
      </SearchContext.Provider>
    </Box>
  )
}

export default EarnList
