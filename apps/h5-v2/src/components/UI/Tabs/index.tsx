import { styled } from '@mui/material'
import { Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'

export const Tabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-list': {
    gap: '20px',
  },
  '& .MuiTabs-indicator': {
    // display: 'none',
    backgroundColor: '#fff',
  },
})

export const Tab = styled(MuiTab)({
  color: '#848E9C',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '1',
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: '12px',
  paddingBottom: '12px',
  minHeight: 'auto',
  minWidth: 'auto',
  '&.Mui-selected': {
    color: '#fff',
  },
})
