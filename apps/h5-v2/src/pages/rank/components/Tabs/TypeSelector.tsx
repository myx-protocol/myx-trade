import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { styled, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'
import { useRankStore } from '../../store'
import { LeaderboardTypeEnum } from '@/api'

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

export const TypeSelector = () => {
  const { type, setType } = useRankStore()
  const typeList: Array<{ label: React.ReactNode; value: LeaderboardTypeEnum }> = useMemo(() => {
    return [
      {
        label: <Trans>BlueChip</Trans>,
        value: LeaderboardTypeEnum.Bluechip,
      },
      {
        label: <Trans>Alpha</Trans>,
        value: LeaderboardTypeEnum.Alpha,
      },
    ]
  }, [])
  return (
    <div className="mt-[16px] px-[6px]">
      <Tabs value={type} onChange={(_, newValue) => setType(newValue as LeaderboardTypeEnum)}>
        {typeList.map((type) => (
          <Tab key={type.value} value={type.value} label={type.label} />
        ))}
      </Tabs>
    </div>
  )
}
