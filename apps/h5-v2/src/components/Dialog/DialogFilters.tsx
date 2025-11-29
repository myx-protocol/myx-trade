import React, { memo, useCallback, useState } from 'react'
import { DialogTheme, DialogTitleTheme, type DialogBaseProps } from '@/components/DialogBase'
import { Trans } from '@lingui/react/macro'
import { DialogSuspense } from '@/components/Loading'
import { Box, Button } from '@mui/material'
import { NumericInput } from '@/components/Dialog/NumberInput.tsx'
import { t } from '@lingui/core/macro'
import { TradeButton } from '@/components/Button/TradeButton.tsx'

type FilterField = [string, string]
interface FilterItemProps {
  // disabled?: boolean,
  value: [string, string]
  label: string | React.ReactNode
  onChange: (value: [string, string]) => void
  endAdornment?: React.ReactNode
  max?: number
  min?: number
}
export interface FilterFields {
  age: FilterField
  mc: FilterField
  progress: FilterField
  change: FilterField
  liq: FilterField
  holders: FilterField
}

export interface DialogFilters {
  open: boolean
  data?: FilterFields
  showCloseIcon: boolean
  onClose: (e?: React.MouseEvent<HTMLButtonElement>, data?: FilterFields) => void
  isShowProgress?: boolean
}

const FilterItem = ({
  label,
  endAdornment,
  value = ['', ''],
  onChange,
  max: maxValue,
  min: minValue,
}: FilterItemProps) => {
  const [min = '', max = ''] = value
  return (
    <Box className={'flex items-center gap-[12px]'}>
      <span className={'text-regular flex-1 text-[12px] leading-[1] font-[500]'}>{label}</span>
      <Box className={'w-[121px]'}>
        <NumericInput
          placeholder={t`Min`}
          value={min}
          max={maxValue}
          min={minValue || 0}
          onValueChange={({ formattedValue }) => onChange([formattedValue, max])}
          endAdornment={endAdornment}
        />
      </Box>
      <Box className={'w-[121px]'}>
        <NumericInput
          placeholder={t`Max`}
          value={max}
          max={maxValue}
          min={minValue || 0}
          onValueChange={({ formattedValue }) => onChange([min, formattedValue])}
          endAdornment={endAdornment}
        />
      </Box>
    </Box>
  )
}

const FiltersDialogContent = ({
  data,
  onClose,
  isShowProgress = true,
}: Omit<DialogFilters, 'showCloseIcon'>) => {
  const [age, setAge] = useState<[string, string]>([data?.age?.[0] || '', data?.age?.[1] || ''])
  const [mc, setMC] = useState<[string, string]>([data?.mc?.[0] || '', data?.mc?.[1] || ''])
  const [progress, setProgress] = useState<[string, string]>([
    data?.progress?.[0] || '',
    data?.progress?.[1] || '',
  ])
  const [change, setChange] = useState<[string, string]>([
    data?.change?.[0] || '',
    data?.change?.[1] || '',
  ])
  const [liq, setLiq] = useState<[string, string]>([data?.liq?.[0] || '', data?.liq?.[1] || ''])
  const [holders, setHolders] = useState<[string, string]>([
    data?.holders?.[0] || '',
    data?.holders?.[1] || '',
  ])

  const reset = () => {
    setAge(['', ''])
    setMC(['', ''])
    setProgress(['', ''])
    setChange(['', ''])
    setLiq(['', ''])
    setHolders(['', ''])

    onClose?.(undefined, {
      age: ['', ''],
      mc: ['', ''],
      progress: ['', ''],
      change: ['', ''],
      liq: ['', ''],
      holders: ['', ''],
    })
  }

  const confirm = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClose?.(e, { age, mc, progress, change, liq, holders })
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

        {isShowProgress && (
          <FilterItem
            label={<Trans>Progress</Trans>}
            value={progress}
            max={100}
            onChange={(value) => setProgress(value)}
          />
        )}

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

export const DialogFilters = memo(
  ({ open, onClose, data, isShowProgress = true }: DialogFilters) => {
    return (
      <DialogTheme
        onClose={() => onClose()}
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
          <FiltersDialogContent
            isShowProgress={isShowProgress}
            data={data}
            onClose={onClose}
            open={open}
          />
        </DialogSuspense>
      </DialogTheme>
    )
  },
)
