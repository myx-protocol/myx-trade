import { Box, styled, Tab, Tabs } from '@mui/material'
import { memo, type ReactNode } from 'react'

interface SubTabItem<T> {
  label: ReactNode
  value: T
}
interface SubTabBarProps<T> {
  className?: string
  items: SubTabItem<T>[]
  value: T
  end?: ReactNode
  handleChange: (value: T) => void
}

interface StyledTabsProps<T> {
  className?: string
  children?: React.ReactNode
  value: T
  onChange: (event: React.SyntheticEvent, newValue: T) => void
}

interface StyledTabProps<T> {
  label: ReactNode
  value: T
}
const StyledTabs = styled((props: StyledTabsProps<any>) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))({
  backgroundColor: 'transparent',
  minHeight: 34,
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

const StyledTab = styled((props: StyledTabProps<any>) => <Tab disableRipple {...props} />)(() => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 14,
  marginRight: 20,
  color: 'var(--secondary-text)',
  padding: 0,
  minWidth: 'fit-content',
  minHeight: 34,
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 700,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}))

export const SubTabBar = memo(
  <T,>({ value, handleChange, items, className = '', end }: SubTabBarProps<T>) => {
    return (
      <Box className={`border-base flex items-center justify-between border-b-1 ${className}`}>
        <StyledTabs
          value={value}
          onChange={(_, value) => handleChange(value)}
          aria-label="basic tabs example"
        >
          {items.map((item, index) => {
            return <StyledTab key={index} label={item.label} value={item.value} />
          })}
        </StyledTabs>
        {end}
      </Box>
    )
  },
)
