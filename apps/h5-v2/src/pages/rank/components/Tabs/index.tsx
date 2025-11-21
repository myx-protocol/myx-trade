import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'
import { useState } from 'react'
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
  const [marketTab, setMarketTab] = useState<
    'hot' | 'new' | 'volume' | 'gainers' | 'losers' | 'marketcap'
  >('hot')
  return (
    <div className="border-b border-[#202129] px-[6px]">
      <MarketTabs value={marketTab} onChange={(_, newValue) => setMarketTab(newValue)}>
        <MarketTab value="hot" label="Hot" />
        <MarketTab value="new" label="New" />
        <MarketTab value="volume" label="Volume" />
        <MarketTab value="gainers" label="Gainers" />
        <MarketTab value="losers" label="Losers" />
        <MarketTab value="marketcap" label="Market Cap" />
      </MarketTabs>
    </div>
  )
}
