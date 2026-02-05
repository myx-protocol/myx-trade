import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { isUndefined } from 'lodash-es'
import { scrollIntroView } from '@/utils'
import { parseBigNumber } from '@/utils/bn'
import { NumericFormat } from 'react-number-format'
import { type NumberInputSourceInfo, type OnValueChange } from './types'
import { twMerge } from 'tailwind-merge'

// 定义组件属性接口
export type NumberInputPrimitiveProps = Prettify<
  Omit<React.ComponentPropsWithoutRef<typeof NumericFormat>, 'onValueChange'> & {
    onValueChange?: OnValueChange
    max?: number | string
    decimalPlaceholder?: boolean
  }
>

const NumberInputPrimitiveBase = React.forwardRef<HTMLInputElement, NumberInputPrimitiveProps>(
  (
    {
      className,
      allowNegative = false,
      thousandSeparator = ',',
      decimalSeparator = '.',
      onValueChange,
      decimalPlaceholder = false,
      max,
      autoFocus,
      onFocus,
      inputMode = 'decimal',
      placeholder,
      decimalScale,
      value,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('')
    const inputRef = useRef<HTMLInputElement>(null)
    const originalInputRef = useRef<HTMLInputElement>(null)

    // 合并 refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    const placeholderLabel = useMemo(() => {
      if (placeholder) return placeholder
      if (!decimalPlaceholder) return undefined

      const scale = !isUndefined(decimalScale) && decimalScale > 0 ? decimalScale : 0
      return scale > 0 ? `0.${'0'.repeat(scale)}` : '0'
    }, [placeholder, decimalPlaceholder, decimalScale])

    // 处理焦点事件
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        scrollIntroView(e)
        onFocus?.(e)
      },
      [onFocus],
    )

    // 处理键盘事件
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 阻止非数字字符（除了小数点、负号、退格、删除、方向键等）
        const allowedKeys = [
          'Backspace',
          'Delete',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Tab',
          'Enter',
          'Escape',
          'Home',
          'End',
        ]

        if (allowedKeys.includes(e.key)) {
          return
        }

        // 允许小数点（半角和全角）
        if (e.key === decimalSeparator || e.key === '。') {
          if (displayValue.includes(decimalSeparator)) {
            e.preventDefault()
          }
          return
        }

        // 允许负号
        if (e.key === '-' && allowNegative) {
          if (displayValue.includes('-') || displayValue.length > 0) {
            e.preventDefault()
          }
          return
        }

        // 只允许数字
        if (!/^\d$/.test(e.key)) {
          e.preventDefault()
        }
      },
      [displayValue, decimalSeparator, allowNegative],
    )

    // 处理输入事件，转换全角字符为半角
    const handleBeforeInput = useCallback(
      (e: React.CompositionEvent<HTMLInputElement> | any) => {
        if (e.data) {
          if (e.data === '。') {
            e.preventDefault()
            const input = e.target as HTMLInputElement
            const start = input.selectionStart || 0
            const end = input.selectionEnd || 0
            const currentValue = displayValue || ''

            if (!currentValue.includes(decimalSeparator as string)) {
              const newValue =
                currentValue.slice(0, start) + decimalSeparator + currentValue.slice(end)

              if (inputRef.current) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  'value',
                )?.set
                nativeInputValueSetter?.call(inputRef.current, newValue)

                const event = new Event('input', { bubbles: true })
                inputRef.current.dispatchEvent(event)

                setTimeout(() => {
                  input.setSelectionRange(start + 1, start + 1)
                }, 0)
              }
            }
          }
        }
      },
      [displayValue, decimalSeparator],
    )

    // 同步外部值变化
    useEffect(() => {
      if (value !== undefined) {
        let newValue = String(value)

        // 如果设置了 decimalScale，确保外部传入的值也遵守小数位限制（截断）
        if (!isUndefined(decimalScale) && newValue) {
          const parts = newValue.split('.')
          if (parts.length === 2 && parts[1].length > decimalScale) {
            newValue = `${parts[0]}.${parts[1].substring(0, decimalScale)}`
          }
        }

        setDisplayValue(newValue)
      }
    }, [value, decimalScale])

    // 计算有效的小数位数
    const effectiveDecimalScale = useMemo(() => {
      // 如果明确指定了 decimalScale，直接使用
      if (!isUndefined(decimalScale)) {
        return decimalScale
      }

      // 如果没有指定 decimalScale，根据整数部分动态判断
      const numValue = parseFloat(displayValue || '0')
      if (!isNaN(numValue) && Math.abs(Math.floor(numValue)) > 0) {
        return 2
      }

      return undefined
    }, [decimalScale, displayValue])

    // 处理自动聚焦
    useEffect(() => {
      if (autoFocus && originalInputRef.current) {
        // 延迟聚焦，确保 DOM 完全渲染
        const timer = setTimeout(() => {
          originalInputRef.current?.focus()
        }, 100)

        return () => clearTimeout(timer)
      }
    }, [autoFocus])

    return (
      <NumericFormat
        // @ts-expect-error NumericFormat ref type issue
        ref={inputRef}
        getInputRef={originalInputRef}
        value={displayValue}
        onValueChange={(values, sourceInfo) => {
          if (values.value === '.') values.value = ''

          // 处理小数位数截取（不四舍五入）
          if (!isUndefined(effectiveDecimalScale) && values.value) {
            const parts = values.value.split('.')
            if (parts.length === 2 && parts[1].length > effectiveDecimalScale) {
              // 直接截取，不四舍五入
              const truncatedValue = `${parts[0]}.${parts[1].substring(0, effectiveDecimalScale)}`
              values = {
                ...values,
                value: truncatedValue,
                floatValue: parseFloat(truncatedValue),
                formattedValue: truncatedValue,
              }
            }
          }

          if (!isUndefined(max) && !isUndefined(values.floatValue)) {
            const valueForBN = parseBigNumber(values.value || 0)
            const maxForBN = parseBigNumber(max || 0)

            if (valueForBN.gt(maxForBN)) {
              values = {
                floatValue: maxForBN.toNumber(),
                value: maxForBN.toString(),
                formattedValue: values.formattedValue.replace(
                  new RegExp(values.value),
                  maxForBN.toString(),
                ),
              }
            }
          }

          onValueChange?.(values, sourceInfo as unknown as NumberInputSourceInfo)
        }}
        isAllowed={(values) => {
          const { value: inputValue } = values

          // 限制小数位数输入（直接阻止超过限制的输入，实现截断效果）
          if (!isUndefined(effectiveDecimalScale) && inputValue) {
            const parts = inputValue.split('.')
            if (parts.length === 2 && parts[1].length > effectiveDecimalScale) {
              return false
            }
          }

          if (!isUndefined(max) && !isUndefined(inputValue)) {
            const newValueForBN = parseBigNumber(inputValue)
            const valueForBN = parseBigNumber(value ?? 0)
            const maxForBN = parseBigNumber(max)
            const isAllowed = !(newValueForBN.gt(maxForBN) && valueForBN.eq(maxForBN))
            return isAllowed
          }

          return true
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        placeholder={placeholderLabel}
        inputMode={inputMode}
        allowLeadingZeros
        thousandSeparator={thousandSeparator}
        allowNegative={allowNegative}
        decimalSeparator={decimalSeparator}
        className={twMerge(
          `w-full min-w-9 flex-1 bg-transparent text-[12px] leading-[1] font-semibold outline-none ${props.disabled ? 'text-[#848E9C]' : 'text-white'} placeholder:text-[#848E9C] ${className || ''} `,
        )}
        {...props}
      />
    )
  },
)

NumberInputPrimitiveBase.displayName = 'NumberInputPrimitive'

export const NumberInputPrimitive = NumberInputPrimitiveBase
