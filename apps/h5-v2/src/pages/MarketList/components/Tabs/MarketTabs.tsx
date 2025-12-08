import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'
import { useMarketPageStore } from '../../store'
import { SearchSecondTypeEnum } from '@myx-trade/sdk'
import { Trans } from '@lingui/react/macro'

const MarketTabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    background: 'transparent',
    '&::before': {
      position: 'absolute',
      left: '50%',
      top: 0,
      transform: 'translateX(-50%)',
      width: '24px',
      height: '2px',
      borderRadius: '20px',
      backgroundColor: '#fff',
      content: '""',
    },
  },
})

export const MarketTab = styled(MuiTab)({
  padding: '14px 15px',
  fontSize: '18px',
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
  const { tab, setTab } = useMarketPageStore()
  return (
    <div className="mt-[6px] border-b-[1px] border-[#202129]">
      <MarketTabs value={tab} onChange={(_, newValue) => setTab(newValue as SearchSecondTypeEnum)}>
        <MarketTab value={SearchSecondTypeEnum.Favorite} label={<Trans>Favorites</Trans>} />
        <MarketTab value={SearchSecondTypeEnum.BlueChips} label={<Trans>Blue Chip</Trans>} />
        <MarketTab value={SearchSecondTypeEnum.Alpha} label={<Trans>Alpha</Trans>} />
      </MarketTabs>
    </div>
  )
}
