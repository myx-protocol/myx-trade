import { useEffect, useRef } from 'react'
import type React from 'react'
export enum DRAG_DIRECTION {
  X = 1,
  Y = 2,
}

export interface UseDragProps {
  direction: DRAG_DIRECTION
  onChange: (value: DragValue) => void
}

export interface DragValue {
  x: number
  y: number
}

export type OnStartMove = (e: React.MouseEvent | React.TouchEvent, onEnd?: () => void) => void

export function getPosition(e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) {
  const obj = 'touches' in e ? e.touches[0] : e

  return { pageX: obj.pageX, pageY: obj.pageY }
}

export const getTarget = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
  const obj = 'touches' in e ? e.touches[0] : e
  return obj.target
}

export const useDrag = ({ direction, onChange }: UseDragProps) => {
  const mouseMoveEventRef = useRef<((event: MouseEvent | TouchEvent) => void) | null>(null)
  const mouseUpEventRef = useRef<((event: MouseEvent | TouchEvent) => void) | null>(null)

  useEffect(
    () => () => {
      if (mouseMoveEventRef.current) {
        document.removeEventListener('mousemove', mouseMoveEventRef.current)
        document.removeEventListener('touchmove', mouseMoveEventRef.current)
      }
      if (mouseUpEventRef.current) {
        document.removeEventListener('mouseup', mouseUpEventRef.current)
        document.removeEventListener('touchend', mouseUpEventRef.current)
      }
    },
    [],
  )

  const onDragStart: OnStartMove = (e: React.MouseEvent | React.TouchEvent, onEnd) => {
    const { pageX: startPageX, pageY: startPageY } = getPosition(e)
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const { pageX, pageY } = getPosition(e)
      const result: DragValue = { x: 0, y: 0 }
      switch (direction) {
        case DRAG_DIRECTION.X:
          result.x = pageX - startPageX
          break
        case DRAG_DIRECTION.Y:
          result.y = pageY - startPageY
      }
      onChange({
        ...result,
      })
    }

    const onMouseUp = () => {
      mouseMoveEventRef.current = null
      mouseUpEventRef.current = null
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onMouseMove)
      document.removeEventListener('touchend', onMouseUp)
      if (onEnd) {
        onEnd()
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onMouseMove)
    document.addEventListener('touchend', onMouseUp)
    mouseMoveEventRef.current = onMouseMove
    mouseUpEventRef.current = onMouseUp
  }
  return {
    onDragStart,
  }
}
