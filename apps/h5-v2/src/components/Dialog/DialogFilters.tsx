import { memo, useCallback, useState } from 'react'
import { DialogTheme, DialogTitleTheme, type DialogBaseProps } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import { DialogSuspense } from '@/components/Loading'
import { Box, Button } from '@mui/material'
import { NumericInput } from '@/components/Dialog/NumberInput.tsx'
import { t } from '@lingui/core/macro'
import { TradeButton } from '@/components/TradeButton.tsx'
interface FilterItemProps {
  // disabled?: boolean,
  value: [string, string]
  label: string | React.ReactNode
  onChange: (value: [string, string]) => void
  endAdornment?: React.ReactNode
}
const FilterItem = ({ label, endAdornment, value = ['', ''], onChange }: FilterItemProps) => {
  const [min = '', max = ''] = value
  return (
    <Box className={'flex items-center gap-[12px]'}>
      <span className={'text-regular flex-1 text-[12px] leading-[1] font-[500]'}>{label}</span>
      <Box className={'w-[121px]'}>
        <NumericInput
          placeholder={t`Min`}
          value={min}
          onValueChange={({ formattedValue }) => onChange([formattedValue, max])}
          endAdornment={endAdornment}
        />
      </Box>
      <Box className={'w-[121px]'}>
        <NumericInput
          placeholder={t`Max`}
          value={max}
          onValueChange={({ formattedValue }) => onChange([min, formattedValue])}
          endAdornment={endAdornment}
        />
      </Box>
    </Box>
  )
}

const FiltersDialogContent = ({ onClose }: DialogBaseProps) => {
  const [age, setAge] = useState<[string, string]>(['', ''])
  const [mc, setMC] = useState<[string, string]>(['', ''])
  const [progress, setProgress] = useState<[string, string]>(['', ''])
  const [change, setChange] = useState<[string, string]>(['', ''])
  const [liq, setLiq] = useState<[string, string]>(['', ''])
  const [holders, setHolders] = useState<[string, string]>(['', ''])

  const reset = () => {
    setAge(['', ''])
    setMC(['', ''])
    setProgress(['', ''])
    setChange(['', ''])
    setLiq(['', ''])
    setHolders(['', ''])
  }

  const confirm = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClose?.(e)
    },
    [age, mc, progress, change, liq, holders],
  )

  return (
    <Box className={'px-[20px] py-[24px] pt-[12px]'}>
      <Box className={'flex w-full flex-col gap-[12px]'}>
        <FilterItem
          label={<Trans>Age(min)</Trans>}
          value={age}
          onChange={(value) => setAge(value)}
        />

        <FilterItem label={<Trans>MC</Trans>} value={mc} onChange={(value) => setMC(value)} />

        <FilterItem
          label={<Trans>Progress</Trans>}
          value={progress}
          onChange={(value) => setProgress(value)}
        />

        <FilterItem
          label={<Trans>Change</Trans>}
          value={change}
          onChange={(value) => setChange(value)}
          endAdornment={'%'}
        />

        <FilterItem label={<Trans>Liq</Trans>} value={liq} onChange={(value) => setLiq(value)} />

        <FilterItem
          label={<Trans>Holders</Trans>}
          value={holders}
          onChange={(value) => setHolders(value)}
        />
      </Box>
      <Box className={'mt-[16px] flex items-center gap-[12px]'}>
        <Button
          variant={'contained'}
          className={'h-[40px] flex-1 !rounded-[40px]'}
          color={'default'}
          onClick={reset}
        >
          <Trans>Reset</Trans>
        </Button>
        <TradeButton
          variant={'contained'}
          className={'!h-[40px] flex-1 !rounded-[40px] !text-[14px]'}
          onClick={confirm}
        >
          <Trans>Filter</Trans>
        </TradeButton>
      </Box>
    </Box>
  )
}

export const DialogFilters = memo(({ open, onClose }: DialogBaseProps) => {
  return (
    <DialogTheme
      onClose={onClose}
      open={open}
      sx={{
        '.MuiPaper-root': {
          maxWidth: '390px',
        },
      }}
    >
      <DialogTitleTheme onClose={onClose}>
        <Trans>Custom Filters</Trans>
      </DialogTitleTheme>

      <DialogSuspense>
        <FiltersDialogContent onClose={onClose} open={open} />
      </DialogSuspense>
    </DialogTheme>
  )
})
