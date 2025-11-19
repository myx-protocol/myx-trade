import { Box } from '@mui/material'
import { ChartArea, ChartLineFill, Seedling, User } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { type ReactNode } from 'react'
import { TrenchType } from '../type'

interface TrenchTabBarProps {
  children?: ReactNode
  type: TrenchType
  onTypeChange: (type: TrenchType) => void
}

const Tabs = () => {
  return [
    {
      icon: <ChartArea size={16} />,
      label: <Trans> Gainers </Trans>,
      value: TrenchType.Gainers,
    },
    {
      icon: <Seedling size={14} />,
      label: <Trans> Latest </Trans>,
      value: TrenchType.Latest,
    },
    {
      icon: <ChartLineFill size={15} />,
      label: <Trans> APR </Trans>,
      value: TrenchType.APR,
    },
    {
      icon: <User size={16} />,
      label: <Trans> Eligible </Trans>,
      value: TrenchType.Eligible,
    },
  ]
}
export const TrenchTabBar = ({ type, onTypeChange, children }: TrenchTabBarProps) => {
  // const [type, setType] = useState(TrenchType.Latest)
  return (
    <Box
      className={
        'bg-deep sticky top-[122px] z-[3] flex items-center justify-between px-[24px] pt-[8px] pb-[16px]'
      }
    >
      <Box className={'flex items-center gap-[8px] leading-[1] font-[500]'}>
        {Tabs().map((tab, _i) => {
          return (
            <Box
              key={tab.value}
              className={`flex cursor-pointer items-center gap-[4px] rounded-[8px] px-[16px] py-[8px] transition ${type === tab.value ? 'text-green bg-brand-10' : 'text-secondary'}`}
              onClick={() => onTypeChange(tab.value)}
            >
              {tab.icon}
              {tab.label}
            </Box>
          )
        })}
      </Box>
      {children}
    </Box>
  )
}
