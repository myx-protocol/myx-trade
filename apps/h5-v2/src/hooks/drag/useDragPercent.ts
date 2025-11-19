import { useCallback, useRef } from 'react'
import { useDrag } from './useDrag'
import type { DragValue, OnStartMove, UseDragProps } from './useDrag'

type useDragPercentProps = {
  containerWidth: number
} & UseDragProps
export const useDragPercent = ({ containerWidth, onChange, ...props }: useDragPercentProps) => {
  const onChangeHandle = (value: DragValue) => {
    onChange({
      x: calcPercent(value.x),
      y: calcPercent(value.y),
    })
  }
  const { onDragStart: onDragStartOrigin } = useDrag({
    ...props,
    onChange: onChangeHandle,
  })
  const sliderRootContainer = useRef<HTMLDivElement | null>(null)

  const calcPercent = (value: number) => {
    const percent = (value / containerWidth) * 100
    return percent
  }

  const onDragStart: OnStartMove = useCallback(
    (e, onEnd) => {
      sliderRootContainer.current = (e.target as HTMLDivElement).parentNode as HTMLDivElement
      onDragStartOrigin(e, onEnd)
    },
    [onDragStartOrigin],
  )

  return {
    onDragStart,
  }
}
