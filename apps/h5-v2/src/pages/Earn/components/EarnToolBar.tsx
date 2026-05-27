import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { SearchIcon } from '@/components/Icon'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { SearchTypeEnum } from '@myx-trade/sdk'
import { EarnTabType } from './type'

const Tabs = ({
  value,
  onChange,
}: {
  value: EarnTabType
  onChange: (value: EarnTabType) => void
}) => {
  const tabs = [
    {
      label: <Trans>Trench</Trans>,
      value: EarnTabType.Trench,
    },
    {
      label: <Trans>Earn</Trans>,
      value: EarnTabType.Earn,
    },
  ]
  return (
    <Box className={'flex items-end gap-[20px] text-center'}>
      {tabs.map((tab) => (
        <span
          key={tab.value}
          className={`cursor-pointer leading-[1] transition-all ${
            value === tab.value
              ? 'text-[18px] font-[700] text-white'
              : 'text-secondary text-[18px] font-[700]'
          }`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </span>
      ))}
    </Box>
  )
}

export const EarnToolBar = ({
  value,
  onChange,
}: {
  value: EarnTabType
  onChange: (value: EarnTabType) => void
}) => {
  const { open } = useGlobalSearchStore()

  return (
    <Box className={'flex w-full items-center justify-between px-[16px] py-[12px]'}>
      <Tabs value={value} onChange={onChange} />
      <Box className={'cursor-pointer'} onClick={() => open({ defaultTab: SearchTypeEnum.Earn })}>
        <SearchIcon size={16} />
      </Box>
    </Box>
  )
}
