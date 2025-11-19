import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent, ChangeEvent, ClipboardEvent } from 'react'

interface CodeInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  error?: boolean
}

export const CodeInput = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  className = '',
  error = false,
}: CodeInputProps) => {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 同步外部 value
  useEffect(() => {
    if (value) {
      const newCodes = value.split('').slice(0, length)
      while (newCodes.length < length) {
        newCodes.push('')
      }
      setCodes(newCodes)
    } else {
      setCodes(Array(length).fill(''))
    }
  }, [value, length])

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const updateCode = (index: number, newValue: string) => {
    const newCodes = [...codes]
    newCodes[index] = newValue
    setCodes(newCodes)

    const fullValue = newCodes.join('')
    onChange?.(fullValue)

    if (fullValue.length === length && fullValue.replace(/\s/g, '').length === length) {
      onComplete?.(fullValue)
    }
  }

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.slice(-1) // 只取最后一个字符

    if (newValue === '' || /^[0-9a-zA-Z]$/.test(newValue)) {
      updateCode(index, newValue)

      // 自动跳转到下一个输入框
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    // Backspace 处理
    if (event.key === 'Backspace') {
      if (codes[index] === '') {
        // 当前输入框为空，跳转到前一个
        if (index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
      } else {
        // 清空当前输入框
        updateCode(index, '')
      }
    }

    // 方向键处理
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text').slice(0, length)

    if (/^[0-9a-zA-Z]*$/.test(pastedData)) {
      const newCodes = Array(length).fill('')
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newCodes[i] = pastedData[i]
      }
      setCodes(newCodes)

      const fullValue = newCodes.join('')
      onChange?.(fullValue)

      // 聚焦到最后一个有值的输入框后面
      const nextIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextIndex]?.focus()

      if (fullValue.length === length) {
        onComplete?.(fullValue)
      }
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el
            }
          }}
          type="text"
          value={code}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={1}
          className={`h-[60px] w-[50px] border bg-[#101114] text-center text-lg font-medium ${error ? 'border-red-500' : 'border-[#3E3F47]'} rounded-lg text-white focus:outline-none ${
            error
              ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'focus:border-[#00E3A5] focus:ring-1 focus:ring-[#00E3A5]'
          } transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
        />
      ))}
    </div>
  )
}
