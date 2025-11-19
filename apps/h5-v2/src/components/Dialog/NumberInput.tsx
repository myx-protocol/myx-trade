import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { InputAdornment, styled, TextField, type TextFieldProps } from '@mui/material'
import { type ComponentType, forwardRef, memo } from 'react'
import { isUndefined } from 'lodash-es'

enum SourceType {
  event = 'event',
  props = 'prop',
}
type Props = Omit<
  NumericFormatProps<TextFieldProps>,
  'prefix' | 'suffix' | 'renderText' | 'size'
> & {
  label?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  textAlign?: 'left' | 'center' | 'right'
  height?: string
  size?: 'small' | 'medium' | 'large'
}

const StyledNumericFormat = styled(NumericFormat<TextFieldProps>)`
  color: var(--basic-white);
  .MuiInputBase-root {
    font-size: 12px;
    font-weight: 500;
    padding: 8px 12px;
    background-color: var(--bg-plus);
    border-radius: 6px;
    height: 28px;

    & fieldset {
      border: none !important;
    }
  }
  & .MuiInputBase-input {
    color: white;
    caret-color: var(--brand-green);
    font-size: inherit;
    font-weight: inherit;
    line-height: 22px;
    height: 100%;
    box-sizing: border-box;
    padding: 0;
    &::placeholder,
    &.Mui-disabled {
      color: var(--third-text); // <UNK>,
      font-weight: 500;
      -webkit-text-fill-color: var(--third-text);
    }
  }
  & .MuiInputAdornment-root {
    color: var(--basic-white);

    .MuiTypography-root {
      color: var(--basic-white);
      font-size: 12px;
    }

    .MuiSelect-root {
      padding-top: 0;
      padding-bottom: 0;

      fieldset {
        border-color: transparent;
      }
    }
  }
`
const ForwardedTextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => (
  <TextField {...props} inputRef={ref} />
))

export const NumericInput = memo(
  ({
    startAdornment,
    endAdornment,
    label,
    textAlign = 'left',
    height = '22px',
    className = '',
    size = 'medium',
    ...rest
  }: Props) => {
    return (
      <StyledNumericFormat
        inputMode="numeric"
        customInput={ForwardedTextField as unknown as ComponentType<TextFieldProps>}
        autoCapitalize={'off'}
        autoComplete={'off'}
        className={`w-full ${size === 'small' ? 'pl-[12px]' : ''} ${className}`}
        isAllowed={(values) => {
          const { value } = values
          const { min, max } = rest
          if (!isUndefined(max) && !isUndefined(value)) {
            const newValueForBN = Number(value)
            const valueForBN = Number(rest.value ?? 0)
            const maxForBN = Number(max)
            const isAllowed = !(newValueForBN > maxForBN && valueForBN === maxForBN)
            return isAllowed
          }
          if (!isUndefined(min) && !isUndefined(value)) {
            const newValueForBN = Number(value)
            const valueForBN = Number(rest.value ?? 0)
            const minForBN = Number(min)
            const isAllowed = !(newValueForBN < minForBN && valueForBN === minForBN)
            return isAllowed
          }

          return true
        }}
        onBlur={(e) => {
          const { value, min, max, onValueChange, onBlur } = rest
          if (!isUndefined(max) && Number(value) > Number(max)) {
            onValueChange?.(
              { value: max?.toString(), floatValue: Number(max), formattedValue: max?.toString() },
              {
                source: SourceType.event,
              },
            )
          }
          if (!isUndefined(min) && Number(value) < Number(min)) {
            onValueChange?.(
              { value: min?.toString(), floatValue: Number(min), formattedValue: min?.toString() },
              {
                source: SourceType.event,
              },
            )
          }
          onBlur?.(e)
        }}
        slotProps={{
          htmlInput: {
            sx: {
              textAlign,
            },
            size: size,
          },
          input: {
            startAdornment: startAdornment ? (
              <InputAdornment className={'text-white'} position="start">
                {startAdornment}
              </InputAdornment>
            ) : undefined,
            endAdornment: endAdornment ? (
              <InputAdornment className={'text-basic-white'} position="end">
                {endAdornment}
              </InputAdornment>
            ) : undefined,
          },
        }}
        {...rest}
      />
    )
  },
)
