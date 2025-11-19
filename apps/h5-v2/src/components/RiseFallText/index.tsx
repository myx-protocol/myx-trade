import clsx from 'clsx'
import { Big, type BigSource } from 'big.js'
import type { ReactNode } from 'react'
import { formatNumber, type NumberFormatOptions } from '@/utils/number'
import { useCallback } from 'react'

export interface RiseFallTextProps {
  /** 数值 */
  value: BigSource
  /** 自定义样式类名 */
  className?: string
  /** 自定义渲染函数 */
  render?: (value: BigSource) => ReactNode
  renderOptions?: NumberFormatOptions
}

export const RiseFallText = ({
  value,
  className = '',
  render,
  renderOptions,
}: RiseFallTextProps) => {
  const renderWrapper = useCallback(
    (value: BigSource) => {
      if (render) {
        return render(value)
      }
      return formatNumber(value, renderOptions)
    },
    [render, renderOptions],
  )
  try {
    // 使用 Big.js 处理数值
    const bigValue = new Big(value)

    // 判断涨跌
    const isRise = bigValue.gt(0)
    const isFall = bigValue.lt(0)

    return (
      <span
        className={clsx(
          {
            'text-rise': isRise,
            'text-fall': isFall,
          },
          className,
        )}
      >
        {renderWrapper(value)}
      </span>
    )
  } catch {
    // 处理无效数字
    return <span className={clsx(className)}>{renderWrapper(value)}</span>
  }
}
