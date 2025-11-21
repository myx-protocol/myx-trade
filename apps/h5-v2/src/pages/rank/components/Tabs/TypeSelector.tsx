import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'

const Tabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
})

export const Tab = styled(MuiTab)({
  padding: '0px 10px',
  fontSize: '14px',
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

type TypeValue = 'bluechip' | 'alpha'

export const TypeSelector = () => {
  const [selectedType, setSelectedType] = useState<TypeValue>('bluechip')
  const typeList: Array<{ label: React.ReactNode; value: TypeValue }> = useMemo(() => {
    return [
      {
        label: <Trans>BlueChip</Trans>,
        value: 'bluechip',
      },
      {
        label: <Trans>Alpha</Trans>,
        value: 'alpha',
      },
    ]
  }, [])
  return (
    <div className="mt-[16px] px-[6px]">
      <Tabs value={selectedType} onChange={(_, newValue) => setSelectedType(newValue)}>
        {typeList.map((type) => (
          <Tab key={type.value} value={type.value} label={type.label} />
        ))}
      </Tabs>
    </div>
  )
}
