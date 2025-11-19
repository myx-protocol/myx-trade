import { MenuItem, Select as MuiSelect, type SelectProps as MuiSelectProps } from '@mui/material'
import { merge } from 'lodash-es'
import type { ReactNode } from 'react'

import SortDownIcon from '@/components/Icon/set/SortDown'

export interface TradeSelectOption {
  label: ReactNode
  value: string | number
}

interface CustomSelectProps {
  options: TradeSelectOption[]
}

type TradeSelectProps = Pick<
  MuiSelectProps,
  'value' | 'onChange' | 'sx' | 'MenuProps' | 'className' | 'IconComponent'
> &
  CustomSelectProps

export const TradeSelect = ({
  value,
  onChange,
  sx,
  MenuProps,
  className,
  options,
  IconComponent,
}: TradeSelectProps) => {
  return (
    <MuiSelect
      value={value}
      onChange={onChange}
      sx={merge(
        {
          color: 'white',
          fontSize: '12px',
          minWidth: '28px',
          fontWeight: 500,
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSelect-icon': {
            color: 'white',
          },
          '& .MuiSelect-select': {
            padding: '0px',
            paddingRight: '3px !important',
          },
        },
        sx,
      )}
      MenuProps={merge(
        {
          PaperProps: {
            sx: {
              backgroundColor: '#202129 !important',
              '& .MuiMenuItem-root': {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#202129 !important',
                color: 'white',
                fontSize: '12px',
                '&:hover': {
                  backgroundColor: '#18191F !important',
                },
                '&.Mui-selected': {
                  backgroundColor: '#18191F !important',
                  color: '#00E3A5',
                },
              },
            },
          },
        } as MuiSelectProps['MenuProps'],
        MenuProps,
      )}
      className={className}
      IconComponent={
        IconComponent ||
        (() => (
          <span className="inline-flex">
            <SortDownIcon size={6} color="#848E9C" />
          </span>
        ))
      }
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiSelect>
  )
}
