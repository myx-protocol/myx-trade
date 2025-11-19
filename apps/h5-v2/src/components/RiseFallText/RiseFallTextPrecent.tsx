import { type BigSource } from 'big.js'
import { decimalToPercent, type PercentFormatOptions } from '@/utils/number'
import { useCallback } from 'react'
import { RiseFallText, type RiseFallTextProps } from '.'

interface RiseFallTextPrecentProps extends Omit<RiseFallTextProps, 'renderOptions'> {
  renderOptions?: PercentFormatOptions
}

export const RiseFallTextPrecent = ({
  render,
  renderOptions = {
    showSign: true,
    removeTrailingZeros: true,
  },
  ...props
}: RiseFallTextPrecentProps) => {
  const renderWrapper = useCallback(
    (value: BigSource) => {
      if (render) {
        return render(value || '0')
      }
      if (value) {
        return decimalToPercent(value, renderOptions)
      }
      return '--'
    },
    [render, renderOptions],
  )
  return <RiseFallText {...props} render={renderWrapper} />
}
