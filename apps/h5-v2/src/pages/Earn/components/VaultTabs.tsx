import { t } from '@lingui/core/macro'
import { Tabs, Tab, styled } from '@mui/material'
import { VaultTabsEnum } from './type'

const StyledTabs = styled(Tabs)({
  display: 'flex',
  flexDirection: 'row',
  minHeight: 'auto',
  flexShrink: 0,
  padding: '0 16px',
  borderBottom: '1px solid #202129',
  '& .MuiTabs-list': {
    gap: '16px',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
})

const StyledTab = styled(Tab)({
  display: 'flex',
  flexDirection: 'row',
  padding: '0px 0 14px',
  minWidth: 'auto',
  minHeight: 'auto',
  color: '#848E9C',
  fontSize: '16px',
  lineHeight: 1,
  fontWeight: 500,
  '&.Mui-selected': {
    color: '#fff',
  },
})

interface VaultTabsProps {
  value: VaultTabsEnum
  onChange: (value: VaultTabsEnum) => void
}
export const VaultTabs = ({ value, onChange }: VaultTabsProps) => {
  const TABS: Array<{
    value: VaultTabsEnum
    label: string
  }> = [
    {
      value: VaultTabsEnum.AllMarket,
      label: t`全部理财`,
    },
    {
      value: VaultTabsEnum.UsdtMarket,
      label: t`USDT理财`,
    },
    {
      value: VaultTabsEnum.UsdcMarket,
      label: t`USDC理财`,
    },
  ]
  return (
    <StyledTabs value={value} onChange={(_, value) => onChange(value)}>
      {TABS.map((tab) => (
        <StyledTab key={tab.value} value={tab.value} label={tab.label} disableRipple />
      ))}
    </StyledTabs>
  )
}
