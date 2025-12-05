import { SubTabBar } from '@/components/SubTabBar.tsx'
import { DetailTabType } from '@/pages/Cook/type.ts'
import { Trans } from '@lingui/react/macro'

const Tabs = [
  {
    label: <Trans>Price</Trans>,
    value: DetailTabType.Price,
  },
  {
    label: <Trans>Trade</Trans>,
    value: DetailTabType.Trade,
  },
  {
    label: <Trans>Introduction</Trans>,
    value: DetailTabType.Info,
  },
]

export const TabBar = ({
  value,
  onChange,
  className,
}: {
  value: DetailTabType
  className?: string
  onChange: (value: DetailTabType) => void
}) => {
  return (
    <SubTabBar
      items={Tabs}
      value={value}
      className={className}
      handleChange={(_value) => onChange(_value as DetailTabType)}
    />
  )
}
