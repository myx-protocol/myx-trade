import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'

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
  '&.Mui-selected': {
    color: '#101114',
    backgroundColor: '#fff',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})

type ResolutionValue = '10m' | '1h' | '4h' | '1d' | '1w' | '1M'

export const ResolutionTabs = () => {
  const [selectedResolution, setSelectedResolution] = useState<ResolutionValue>('1h')
  return (
    <Tabs value={selectedResolution} onChange={(_, newValue) => setSelectedResolution(newValue)}>
      <Tab value="10m" label="10m" />
      <Tab value="1h" label="1h" />
      <Tab value="4h" label="4h" />
      <Tab value="1d" label="1d" />
      <Tab value="1w" label="1w" />
      <Tab value="1M" label="1M" />
    </Tabs>
  )
}
