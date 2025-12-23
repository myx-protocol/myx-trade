import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'

export const TradeRecordTabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-list': {
    gap: '24px',
  },
  '& .MuiTabs-indicator': {
    height: 1,
    background: '#fff',
  },
})

export const TradeRecordTab = styled(MuiTab)({
  padding: '16px 0',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1',
  color: '#848E9C',
  minHeight: 'auto',
  minWidth: 'auto',
  textTransform: 'none',
  '&.Mui-selected': {
    color: '#fff',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})
