import React, { useCallback, useRef, useEffect, useState } from 'react'
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

    // 合并 refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    const decimalPlaceholderLabel =
      !isUndefined(decimalScale) && decimalScale > 0 ? `0.${'0'.repeat(decimalScale)}` : '0'
    const placeholderLabel =
      placeholder ?? (decimalPlaceholder ? decimalPlaceholderLabel : undefined)

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
        // 直接使用外部传入的值，不进行格式化，保持用户输入的原始格式
        setDisplayValue(String(value))
      }
    }, [value])

    // 动态计算小数位数：如果整数部分有值，则显示2位小数
    const getEffectiveDecimalScale = useCallback(
      (inputValue: string) => {
        if (isUndefined(decimalScale)) {
          // 如果没有指定 decimalScale，检查整数部分
          const numValue = parseFloat(inputValue || '0')
          if (!isNaN(numValue) && Math.abs(Math.floor(numValue)) > 0) {
            return 2
          }
        }
        return decimalScale
      },
      [decimalScale],
    )

    const effectiveDecimalScale = getEffectiveDecimalScale(displayValue)

    return (
      <NumericFormat
        // @ts-expect-error NumericFormat ref type issue
        ref={inputRef}
        value={displayValue}
        onValueChange={(values, sourceInfo) => {
          if (values.value === '.') values.value = ''

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
        decimalScale={effectiveDecimalScale}
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
