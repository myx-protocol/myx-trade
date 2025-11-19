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

const EarnList = () => {
  const [chainId, setChainId] = useState<number>()
  const [interval, setInterval] = useState<Interval>()
  return (
    <Container className={'flex !w-[1190px] !min-w-[1190px] flex-col px-[40px] pt-[32px]'}>
      <Box className={'flex flex-col gap-[16px] px-[32px] pt-[24px] leading-[1.1]'}>
        <h1 className={'text-[56px] font-[700] text-white'}>
          <Trans>Liquidity Earning</Trans>
        </h1>
        <p className={'text-regular text-[20px] font-[500]'}>
          <Trans>Generate stable returns by providing USD liquidity</Trans>
        </p>
      </Box>
      <Box className={'mt-[48px] h-[172px]'}>
        <Carousel />
      </Box>
      <SearchContext.Provider value={{ chainId, setChainId, interval, setInterval }}>
        <ToolBar />
        <Dashboard />
        <Vaults className={'mt-[24px]'} />
      </SearchContext.Provider>
    </Container>
  )
}

export default EarnList
