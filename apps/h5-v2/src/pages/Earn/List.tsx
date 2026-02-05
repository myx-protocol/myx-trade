import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { Carousel } from '@/pages/Earn/components/Carousel.tsx'
import { Vaults } from '@/pages/Earn/components/Vaults.tsx'
import { useState } from 'react'
import { Interval } from '@/request/type.ts'
import { SearchBar } from '@/components/SearchBar.tsx'
import { TabBar } from '@/pages/Earn/components/TabBar.tsx'
import { VaultType } from '@/pages/Earn/type.ts'
import { IntervalList } from '@/pages/Cook/components/Interval.tsx'
import { ChainDropDownMenu } from '@/pages/Cook/components/ChainDropDownMenu.tsx'
import { SearchContext } from './context'
import { Positions } from '@/pages/Earn/components/Positions.tsx'
import { SearchTypeEnum } from '@myx-trade/sdk'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { ConnectWallet } from '@/pages/Earn/components/ConnectWallet.tsx'

const EarnList = () => {
  const [chainId, setChainId] = useState<number>()
  const [interval, setInterval] = useState<Interval | undefined>(Interval['24h'])
  const [type, setType] = useState<VaultType>(VaultType.Vaults)

  return (
    <Box className={'h-[calc(100vh-var(--tabbar-height))] overflow-hidden'}>
      <Box
        id={'scrollView'}
        className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto"
      >
        <SearchBar defaultTab={SearchTypeEnum.Earn} />
        <Box className={'mt-[20px]'}>
          <Carousel />
        </Box>
        <Box className={'bg-deep sticky top-[0] z-[1] pt-[20px] pb-[4px]'}>
          <h2 className={'my-[8px] px-[16px] text-[18px] leading-[1] font-[700] text-white'}>
            <Trans>Vaults</Trans>
          </h2>
          <TabBar value={type} setValueType={setType} />
          <Box className={'mt-[8px] flex items-center justify-between pr-[16px] pl-[16px]'}>
            <IntervalList interval={interval} setInterval={setInterval} />
            <ChainDropDownMenu setChainId={setChainId} chainId={chainId} />
          </Box>
          <Box className={'mt-[16px]'}>
            <Box
              className={
                'text-third flex items-center justify-between px-[16px] text-[12px] leading-[1]'
              }
            >
              <span>
                <Trans>Vault</Trans>
              </span>
              <span>
                {type === VaultType.Positions ? (
                  <>
                    <Trans>Amount</Trans>/<Trans>24h PnL</Trans>
                  </>
                ) : (
                  <>
                    <Trans>TVL</Trans>/<Trans>APR</Trans>
                  </>
                )}
              </span>
            </Box>
          </Box>
        </Box>

        <SearchContext.Provider value={{ chainId, setChainId, interval, setInterval }}>
          {/*<Box className={'flex-1'}>*/}
          {type === VaultType.Positions ? (
            <ConnectWallet>
              <Positions />
            </ConnectWallet>
          ) : (
            <Vaults />
          )}
          {/*</Box>*/}
        </SearchContext.Provider>
      </Box>
    </Box>
  )
}

export default EarnList
