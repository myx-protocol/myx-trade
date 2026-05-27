import { useCallback, type RefObject } from 'react'
import {
  MAX_SLIPPING_PERCENT,
  MIN_SLIPPING_PERCENT,
  DEFAULT_SLIPPAGE,
  SLIPPAGE_DECIMALS,
} from '@/constant/slippage'

interface SlippageInputProps {
  /** Slippage as percent string, e.g. "1" = 1% */
  value: string
  /** Called with percent string, e.g. "1" */
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  autoFocus?: boolean
  className?: string
  inputRef?: RefObject<HTMLInputElement | null>
}

/**
 * Pure slippage percentage input.
 * Always renders an editable `<input>` + `%` suffix.
 *
 * - `value` / `onChange` use **percent** form ("1" = 1%).
 * - Enforces 0–50 range, max 2 decimal places.
 */
export const SlippageInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  autoFocus,
  className,
  inputRef,
}: SlippageInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '')
      const parts = raw.split('.')
      if (parts.length > SLIPPAGE_DECIMALS) return
      if (parts.length === SLIPPAGE_DECIMALS && parts[1].length > SLIPPAGE_DECIMALS) return
      if (raw === '' || raw === '.') {
        onChange(raw)
        return
      }
      if (Number(raw) <= MAX_SLIPPING_PERCENT) {
        onChange(raw)
      }
    },
    [onChange],
  )

  const handleBlur = useCallback(() => {
    const num = Number(value)
    if (isNaN(num) || value === '' || value === '.') {
      onChange(String(DEFAULT_SLIPPAGE * 100))
    } else if (num < MIN_SLIPPING_PERCENT) {
      onChange(String(MIN_SLIPPING_PERCENT))
    } else if (num > MAX_SLIPPING_PERCENT) {
      onChange(String(MAX_SLIPPING_PERCENT))
    }
    onBlur?.()
  }, [value, onChange, onBlur])

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const len = e.target.value.length
      requestAnimationFrame(() => {
        e.target.setSelectionRange(len, len)
      })
      onFocus?.()
    },
    [onFocus],
  )

  return (
    <div className={`flex items-center gap-[4px] text-white ${className ?? ''}`}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        className="w-[40px] bg-transparent text-right text-[12px] leading-[1] font-medium outline-none"
        placeholder={`${DEFAULT_SLIPPAGE * 100}`}
      />
      <span className="text-[12px] leading-[1] font-medium text-white">%</span>
    </div>
  )
}
