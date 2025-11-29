import { Box, styled, Tab, Tabs } from '@mui/material'
import type { ReactNode } from 'react'

interface SubTabItem {
  label: ReactNode
  value: number | string
}
interface SubTabBarProps {
  className?: string
  items: SubTabItem[]
  value: number | string
  end?: ReactNode
  handleChange: (value: number | string) => void
}

interface StyledTabsProps {
  className?: string
  children?: React.ReactNode
  value: number | string
  onChange: (event: React.SyntheticEvent, newValue: number) => void
}

interface StyledTabProps {
  label: ReactNode
}
const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))({
  backgroundColor: 'transparent',
  minHeight: 38,
  paddingLeft: 16,
  paddingRight: 16,
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 24,
    width: '100%',
    backgroundColor: 'var(--basic-white)',
  },
})

const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(() => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 14,
  marginRight: 20,
  color: 'var(--secondary-text)',
  padding: 0,
  minWidth: 'fit-content',
  minHeight: 38,
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 700,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

export const SubTabBar = ({ value, handleChange, items, className = '', end }: SubTabBarProps) => {
  return (
    <Box className={`border-base flex items-center justify-between border-b-1 ${className}`}>
      <StyledTabs
        value={value}
        onChange={(_, value) => handleChange(value)}
        aria-label="basic tabs example"
      >
        {items.map((item, index) => {
          return <StyledTab key={item.value} label={item.label} />
        })}
      </StyledTabs>
      {end}
    </Box>
  )
}
