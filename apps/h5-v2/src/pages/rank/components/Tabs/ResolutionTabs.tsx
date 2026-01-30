import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'
import { useRankStore } from '../../store'
import type { LeaderboardTimeInterval } from '@/api'

const Tabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-list': {
    gap: '6px',
  },
})

export const Tab = styled(MuiTab)({
  padding: '6px 8px',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '1',
  color: '#848E9C',
  minHeight: 'auto',
  minWidth: 'auto',
  borderRadius: '500px',
  textTransform: 'none',
  '&.Mui-selected': {
    color: '#101114',
    backgroundColor: '#fff',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})

export const ResolutionTabs = () => {
  const { timeInterval, setTimeInterval } = useRankStore()
  return (
    <Tabs
      value={timeInterval}
      onChange={(_, newValue) => setTimeInterval(newValue as LeaderboardTimeInterval)}
    >
      <Tab value="10m" label="10m" />
      <Tab value="1h" label="1h" />
      <Tab value="4h" label="4h" />
      <Tab value="12h" label="12h" />
      <Tab value="24h" label="1d" />
    </Tabs>
  )
}
