import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { Carousel } from '@/pages/Earn/components/Carousel.tsx'
import { Vaults } from '@/pages/Earn/components/Vaults.tsx'
import { useEffect, useState } from 'react'
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
import { t } from '@lingui/core/macro'
import { VaultTabs } from './components/VaultTabs'
import { VaultTabsEnum } from './components/type'
import { useQuery } from '@tanstack/react-query'
import type { QuotePoolListRequest } from '@/request/lp/type'
import { getQuoteLpList } from '@/request'

const EarnList = () => {
  const [chainId, setChainId] = useState<number>()
  const [interval, setInterval] = useState<Interval | undefined>(Interval['24h'])
  const [type, setType] = useState<VaultType>(VaultType.Vaults)
  const [tabValue, setTabValue] = useState<VaultTabsEnum>(VaultTabsEnum.AllMarket)
  useEffect(() => {
    document.title = t`Earn - Stable Yields & Low Risk | MYX`
  }, [])

  const { data: defaultTabValue, isLoading: isDefaultTabValueLoading } = useQuery({
    queryKey: [{ key: 'quotePoolList-check' }, chainId, interval],
    queryFn: async () => {
      const params: QuotePoolListRequest = {
        timeInterval: interval,
        chainId: chainId,
        limit: 1,
        state: 1,
      }
      const resultList = await Promise.allSettled([
        getQuoteLpList({
          ...params,
          quoteSymbol: 'USDT',
        }),
        getQuoteLpList({
          ...params,
          quoteSymbol: 'USDC',
        }),
      ])
      const result = resultList.map((item) =>
        item.status === 'fulfilled' ? item.value.data : null,
      )
      if (result[0]?.length && result[1]?.length) {
        return VaultTabsEnum.AllMarket
      }
      if (result[0]?.length) {
        return VaultTabsEnum.UsdtMarket
      }
      if (result[1]?.length) {
        return VaultTabsEnum.UsdcMarket
      }
      return VaultTabsEnum.AllMarket
    },
  })

  useEffect(() => {
    if (!isDefaultTabValueLoading && defaultTabValue) {
      setTabValue(defaultTabValue)
    }
  }, [defaultTabValue, isDefaultTabValueLoading])

  const isShowTabs = Boolean(
    !isDefaultTabValueLoading && defaultTabValue === VaultTabsEnum.AllMarket,
  )
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
        <Box className={'bg-deep sticky top-[0] z-[1] pt-[24px] pb-[4px]'}>
          {isShowTabs && <VaultTabs value={tabValue} onChange={setTabValue} />}
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

        <SearchContext.Provider
          value={{ chainId, setChainId, interval, setInterval, tabValue, setTabValue }}
        >
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
