import { Trans } from '@lingui/react/macro'
import { type ReactNode } from 'react'
import { TrenchType } from '../type'
import { SubTabBar } from '@/components/SubTabBar.tsx'

interface TrenchTabBarProps {
  children?: ReactNode
  className?: string
  type: TrenchType
  onTypeChange: (type: TrenchType) => void
}
const items = [
  {
    label: <Trans>All</Trans>,
    value: TrenchType.Eligible,
  },
  {
    label: <Trans> Gainers </Trans>,
    value: TrenchType.Gainers,
  },
  {
    label: <Trans> Latest </Trans>,
    value: TrenchType.Latest,
  },
  {
    label: <Trans> APR </Trans>,
    value: TrenchType.APR,
  },
]

export const TrenchTabBar = ({ type, className, onTypeChange }: TrenchTabBarProps) => {
  return (
    <>
      <SubTabBar
        items={items}
        value={type}
        className={className}
        handleChange={(_value) => onTypeChange(_value as TrenchType)}
      />
    </>
  )
}
