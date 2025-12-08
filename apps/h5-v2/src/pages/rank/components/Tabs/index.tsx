import type { LeaderboardSortField } from '@/api'
import { Trans } from '@lingui/react/macro'
import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'
import { useRankStore } from '../../store'
export { ResolutionTabs } from './ResolutionTabs'

const MarketTabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    background: 'transparent',
    '&::before': {
      position: 'absolute',
      left: '50%',
      top: 0,
      transform: 'translateX(-50%)',
      width: '20px',
      height: '2px',
      borderRadius: '20px',
      backgroundColor: '#fff',
      content: '""',
    },
  },
})

export const MarketTab = styled(MuiTab)({
  padding: '4px 10px 12px',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '1',
  color: '#848E9C',
  minHeight: 'auto',
  minWidth: 'auto',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: '700',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})

export const Tabs = () => {
  const { tabsType, setTabsType } = useRankStore()
  return (
    <div className="border-b border-[#202129] px-[6px]">
      <MarketTabs
        value={tabsType}
        onChange={(_, newValue) => setTabsType(newValue as LeaderboardSortField)}
      >
        <MarketTab value="tvl" label={<Trans>Hot</Trans>} />
        <MarketTab value="tokenCreateTime" label={<Trans>New</Trans>} />
        <MarketTab value="volume" label={<Trans>Volume</Trans>} />
        <MarketTab value="topGainers" label={<Trans>Gainers</Trans>} />
        <MarketTab value="topLosers" label={<Trans>Losers</Trans>} />
        <MarketTab value="marketCap" label={<Trans>Market Cap</Trans>} />
      </MarketTabs>
    </div>
  )
}
