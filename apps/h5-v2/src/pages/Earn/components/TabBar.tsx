import { styled, Tabs, Tab } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { VaultType } from '@/pages/Earn/type.ts'

const Items = [
  {
    label: <Trans>Positions</Trans>,
    value: VaultType.Positions,
  },
  {
    label: <Trans>Vaults</Trans>,
    value: VaultType.Vaults,
  },
]

const StyledTabs = styled(Tabs)({
  minHeight: 'auto',
  borderBottom: '1px solid #202129',
  padding: '0 16px',
  '& .MuiTabs-list': {
    gap: '20px',
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
})

const StyledTab = styled(Tab)({
  padding: '14px 0',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1',
  minWidth: 0,
  color: '#848E9C',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: '700',
  },
})

export const TabBar = ({
  value,
  setValueType,
}: {
  value: VaultType
  setValueType: (value: VaultType) => void
}) => {
  return (
    <StyledTabs value={value} onChange={(_, value) => setValueType(value as VaultType)}>
      {Items.map((item) => (
        <StyledTab key={item.value} label={item.label} value={item.value} disableRipple />
      ))}
    </StyledTabs>
  )
}
