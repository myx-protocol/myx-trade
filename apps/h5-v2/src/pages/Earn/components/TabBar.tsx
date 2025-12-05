import { Box } from '@mui/material'
import { SubTabBar } from '@/components/SubTabBar.tsx'
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

export const TabBar = ({
  value,
  className = '',
  setValueType,
}: {
  value: VaultType
  className?: string
  setValueType: (value: VaultType) => void
}) => {
  return (
    <Box className={'flex w-full justify-center'}>
      <SubTabBar
        items={Items}
        value={value}
        className={`flex-1 ${className}`}
        handleChange={(_value) => setValueType(_value as VaultType)}
      />
    </Box>
  )
}
