import { useContext } from 'react'
import { Box, IconButton } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { SearchIcon } from '@/components/Icon'
import { ChainSelector } from '@/pages/Cook/components/ChainSelector.tsx'
import { IntervalSelector } from '@/pages/Cook/components/IntervalSelector.tsx'
import { Interval } from '@/request/type.ts'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { SearchContext } from '@/pages/Earn/context.ts'
import { SearchTypeEnum } from '@myx-trade/sdk'

export const ToolBar = () => {
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const { chainId, setChainId, interval, setInterval } = useContext(SearchContext)
  return (
    <Box className={'bg-deep flex h-[88px] w-full items-center justify-between py-[24px]'}>
      <h2 className={'text-[32px] leading-[1] font-[700] text-white'}>
        <Trans>Vaults</Trans>
      </h2>
      <Box className={'flex items-center gap-[10px]'}>
        <IntervalSelector
          interval={interval}
          setInterval={(_value) => setInterval(_value as Interval)}
        />

        <ChainSelector chainId={chainId} setChainId={(id) => setChainId(id)} />

        <IconButton
          className={
            '!border-dark-border h-[40px] w-[40px] !rounded-[6px] !border-1 py-[4px] !text-white'
          }
          onClick={() =>
            openGlobalSearch({
              defaultTab: SearchTypeEnum.Earn,
            })
          }
        >
          <SearchIcon size={14} />
        </IconButton>
      </Box>
    </Box>
  )
}
