import { forwardRef, memo, useCallback } from 'react'
import { Box, styled, TextField, type TextFieldProps } from '@mui/material'
import { ClearFill, SearchIcon } from '@/components/Icon'
import InputAdornment from '@mui/material/InputAdornment'
import { Trans } from '@lingui/react/macro'

const StyledSearch = styled(TextField)`
  height: 100%;
  text-transform: uppercase;
  &::placeholder {
    color: var(--secondary-text);
    opacity: 1;
    font-size: 12px;
    font-weight: 400;
  }
  &.rounded {
    --border-input-r: 50px;
  }
  & .MuiOutlinedInput-root {
    border-radius: var(--border-input-r);
    padding: 12px;
    background: var(--bg-plus);
    height: 100%;
    box-sizing: border-box;
  }
  & .MuiOutlinedInput-notchedOutline {
    border: none;
    //borderBottom: '1px solid #333', // 只要底部边框
    border-radius: var(--border-input-r);
  }
  & input {
    padding: 0;
    height: 24px;
    color: var(--basic-white);
    caret-color: var(--brand-green);
    font-size: 13px;
    ::placeholder {
      color: var(--third-text);
      opacity: 1;
    }
  }
  & .MuiInputAdornment-root {
    margin-right: 8px;
  }
`

export type SearchProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  className?: string
  value?: string
  onChange?: (value: string) => void
  isRounded?: boolean
  children?: React.ReactNode
  canPaste?: boolean
}

export const Search = memo(
  forwardRef<HTMLInputElement, SearchProps>(
    (
      {
        isRounded = true,
        className = '',
        value,
        onChange,
        onBlur,
        children,
        canPaste = true,
        ...reset
      },
      ref,
    ) => {
      const onPaste = useCallback(
        async (_e: React.MouseEvent<HTMLDivElement>) => {
          // console.log()
          const text = await navigator.clipboard.readText()
          // const value = text?.slice(0, MAX_LENGTH)
          onChange?.(text || '')
        },
        [onChange],
      )

      const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        // 阻止 blur
        event.preventDefault()
      }
      return (
        <Box className={`bg-base-bg flex h-[42px] w-full gap-[12px] rounded-[8px] ${className}`}>
          <div className="h-full flex-1">
            <StyledSearch
              className={`gap-[4px] ${isRounded ? 'rounded' : ''}`}
              variant="outlined"
              placeholder={`BTCUSDC`}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <SearchIcon className={'text-third mr-[8px]'} size={14} />,
                  endAdornment: !canPaste ? null : value ? (
                    <InputAdornment position="end">
                      <Box
                        className={'cursor-pointer'}
                        width={'16px'}
                        height={'16px'}
                        onMouseDown={handleMouseDown}
                        onClick={() => {
                          // e.preventDefault ();
                          onChange?.('')
                          // ref.current?.focus();
                        }}
                      >
                        <ClearFill className={'text-secondary'} size={16} />
                      </Box>
                    </InputAdornment>
                  ) : (
                    <Box
                      className={'text-green cursor-pointer text-[12px] font-[500] capitalize'}
                      onMouseDown={handleMouseDown}
                      onClick={onPaste}
                    >
                      <Trans>Paste</Trans>
                    </Box>
                  ),
                },
              }}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange?.(e.target.value)
              }}
              onBlur={(e) => onBlur?.(e)}
              {...reset}
              inputRef={ref}
            />
          </div>
          {children}
        </Box>
      )
    },
  ),
)
