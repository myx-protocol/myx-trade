import { DRAG_DIRECTION, getPosition, getTarget } from '@/hooks/drag/useDrag'
import { useDragPercent } from '@/hooks/drag/useDragPercent'
import { isUndefined } from 'lodash-es'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { div, minus, mul } from '@/utils/math'
import { isMobile } from '@/utils'
import type { DragValue } from '@/hooks/drag/useDrag'
import Big from 'big.js'
import clsx from 'clsx'

type MarkItemProps = {
  value: number
  label?: string
}
interface CustomSliderProps {
  marks: MarkItemProps[]
  max?: number
  min?: number
  value: number
  disabled?: boolean
  hideLabelText?: boolean
  onChange: ({ value }: { value: number }) => void
  toolTip?: boolean
}

interface SliderContext {
  hideLabelText: boolean
  valueRange: number
  value: number
  min: number | string
  max: number | string
  marks: { value: string; label: string }[]
  disabled: boolean
  onChange: (value: number) => void
  toolTip: boolean
  // isDrag: React..MutableRefObject
  isDrag: React.MutableRefObject<boolean>
  isDraging: boolean
  setIsDraging: (bool: boolean) => void
}

const CustomSliderContext = createContext<SliderContext>({} as SliderContext)

const useSliderPropsWrapper = ({
  max,
  min,
  value,
  onChange,
  marks,
  disabled,
  toolTip,
}: CustomSliderProps) => {
  const minValueProxy: string | number = useMemo(
    () => (isUndefined(min) ? ('0' as string) : min),
    [min],
  )
  const maxValueProxy: string | number = useMemo(
    () => (isUndefined(max) ? ('100' as string) : max),
    [max],
  )
  const disabledProxy = useMemo<boolean>(() => Boolean(disabled), [disabled])
  const valueRange = useMemo(() => {
    return minus(maxValueProxy, minValueProxy).toNumber()
  }, [maxValueProxy, minValueProxy])

  const valueProxy = useMemo(() => {
    let valueOrigin = Number(value)
    if (valueOrigin > Number(maxValueProxy)) {
      valueOrigin = Number(maxValueProxy)
    }
    if (valueOrigin < Number(minValueProxy)) {
      valueOrigin = Number(minValueProxy)
    }
    const valueNumber = Number(minus(valueOrigin, minValueProxy).div(valueRange).mul(100))
    return valueNumber
  }, [maxValueProxy, value, minValueProxy, valueRange])
  const markItemArr = useMemo<SliderContext['marks']>(
    () =>
      marks.map((item) => {
        const { value: valueOrigin, label } = item
        const value = minus(valueOrigin, minValueProxy).toNumber()
        // let value = ''
        let returnValue = ''
        if (Big(value).eq(Big(minValueProxy))) {
          returnValue = '0'
        } else if (Big(value).eq(Big(maxValueProxy))) {
          returnValue = '100'
        } else {
          returnValue = div(value, valueRange).mul(100).toString()
        }
        return {
          value: returnValue,
          label: label || '',
        }
      }),
    [valueRange, marks, minValueProxy, maxValueProxy],
  )

  const calcValue = useCallback(
    (rate: number) => {
      let value = Math.round(Number(mul(valueRange, rate).div(100).plus(minValueProxy).toFixed(2)))
      value = Math.min(value, Number(maxValueProxy))
      value = Math.max(Number(minValueProxy), value)
      return value
    },
    [minValueProxy, maxValueProxy, valueRange],
  )

  const onBeforeChange = useCallback(
    (rate: number) => {
      if (disabledProxy) return
      const value = calcValue(rate)
      onChange({
        value,
      })
    },
    [calcValue, onChange, disabledProxy],
  )

  const [isDraging, setIsDraging] = useState<boolean>(false)

  return {
    min: minValueProxy,
    max: maxValueProxy,
    value: valueProxy,
    marks: markItemArr,
    onChange: onBeforeChange,
    valueRange,
    disabled: disabledProxy,
    toolTip: toolTip || false,
    isDraging,
    setIsDraging,
    calcValue,
  }
}

const MarkItemLabel = ({
  children,
  isLight,
  isLast = false,
}: {
  children: React.ReactNode
  isLight: boolean
  isLast?: boolean
}) => {
  return (
    <span
      className={clsx(
        `absolute top-[calc(100%+12px)] left-[5.5px] w-max -translate-x-1/2 ${isLight ? 'text-sm font-medium text-white' : 'text-xs text-[#848E9C]'} `,
        {
          '': isLast,
        },
      )}
    >
      {children}
    </span>
  )
}

const MarkItems = ({
  left,
  label,
  labelActive,
}: {
  left: number | string
  label: string
  labelActive: boolean
}) => {
  const { value, onChange, isDrag, hideLabelText } = useContext(CustomSliderContext)
  const isLight = useMemo(() => Number(value) >= Number(left), [left, value])

  const onItemClickHandle = useCallback(() => {
    if (isDrag.current && isMobile()) return
    onChange(Number(left))
    // event.stopPropagation()
  }, [left, onChange, isDrag])
  return (
    <>
      {isLight ? (
        <li
          className="absolute z-10 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-[2px] border-[#3D996B] bg-[#18191F]"
          style={{ left: `${left}%` }}
          onMouseDown={onItemClickHandle}
          onTouchStart={onItemClickHandle}
        >
          {!hideLabelText && <MarkItemLabel isLight={labelActive}>{label}</MarkItemLabel>}
        </li>
      ) : (
        <li
          className="absolute z-10 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-[2px] border-[#31333D] bg-[#18191F]"
          style={{ left: `${left}%` }}
          onMouseDown={onItemClickHandle}
          onTouchStart={onItemClickHandle}
        >
          {!hideLabelText && <MarkItemLabel isLight={labelActive}>{label}</MarkItemLabel>}
        </li>
      )}
    </>
  )
}

const Marks = () => {
  const { value, onChange, marks, disabled, isDrag } =
    useContext<SliderContext>(CustomSliderContext)
  const sliderRootRef = useRef<HTMLUListElement>(null)

  const activeLabelIndex = useMemo(() => {
    for (let i = marks.length - 1; i >= 0; i--) {
      if (Number(marks[i].value) <= value) {
        return i
      }
    }
    return -1
  }, [value, marks])

  const onClickHandle = (e: React.TouchEvent | React.MouseEvent) => {
    if (isDrag.current && isMobile()) return
    if (e.type === 'mousedown' && isMobile()) return
    const ract = sliderRootRef.current?.getBoundingClientRect()
    const left = ract?.left as number
    const { pageX } = getPosition(e)
    const newSliderRate = minus(pageX, left)
      .div(ract?.width as number)
      .mul(100)
      .toNumber()
    onChange(newSliderRate)
    // e.stopPropagation();
  }

  return (
    <ul
      data-name="4"
      className={`absolute z-10 h-[11px] w-full ${disabled ? 'cursor-no-drop' : 'cursor-pointer'}`}
      ref={sliderRootRef}
      onMouseDown={onClickHandle}
      onTouchStart={onClickHandle}
    >
      {marks.map(({ value, label }, index: number) => (
        <MarkItems
          left={value}
          key={value}
          label={label}
          labelActive={activeLabelIndex === index}
        />
      ))}
    </ul>
  )
}

const SliderDropMarkToolTip = () => {
  const { toolTip, value, isDraging } = useContext(CustomSliderContext)
  const isOpenToolTip = useMemo(() => toolTip && isDraging, [toolTip, isDraging])
  if (!isOpenToolTip) return <></>
  return (
    <div className="absolute bottom-[calc(100%+8px)] left-1/2 mx-auto w-max -translate-x-1/2 rounded bg-[#18191F] p-1 leading-none shadow-[0px_0px_20px_0px_rgba(0,0,0,0.25)]">
      <div className="absolute right-0 -bottom-[1px] left-0 -z-10 mx-auto h-[11px] w-[11px] rotate-[-45deg] rounded-sm bg-[#18191F]"></div>
      <span className="text-sm leading-[1.2] text-white">{value}%</span>
    </div>
  )
}

const SliderDropMark = () => {
  const { value, disabled } = useContext(CustomSliderContext)
  return (
    <div
      data-m-slider-name="slider-mark"
      style={{ left: `${value}%` }}
      data-slider-type="slider-trigger"
      className={`absolute top-0 z-[11] h-[18px] w-[18px] -translate-x-1/2 -translate-y-[3.5px] rounded-full border-[3px] border-[#3D996B] bg-[#18191F] ${disabled ? 'cursor-no-drop' : 'cursor-pointer'}`}
    >
      <SliderDropMarkToolTip />
    </div>
  )
}

export const CustomSlider = ({ hideLabelText = false, ...props }: CustomSliderProps) => {
  const { calcValue, ...sliderPropsWrapperValue } = useSliderPropsWrapper(props)
  const [containerWidth, setContainerWidth] = useState(0)
  const sliderDropRoot = useRef<HTMLDivElement>(null)
  const containerWidthRef = useRef<number>(0)
  const currentValueRef = useRef(0)
  const dragInitValue = useRef(0)
  const isDraging = useRef<boolean>(false)
  useEffect(() => {
    if (sliderDropRoot.current) {
      setContainerWidth(sliderDropRoot.current.offsetWidth)
      if (!containerWidthRef.current) {
        containerWidthRef.current = sliderDropRoot.current.offsetWidth
      }
    }
  }, [])

  const sliderPropsWrapperValueProxy = useMemo(() => {
    return {
      ...sliderPropsWrapperValue,
      isDrag: isDraging,
      hideLabelText,
    }
  }, [sliderPropsWrapperValue, hideLabelText, isDraging])

  useEffect(() => {
    currentValueRef.current = sliderPropsWrapperValue.value
  }, [sliderPropsWrapperValue.value])

  const onChangeHandle = (changeValue: DragValue) => {
    sliderPropsWrapperValue.onChange(dragInitValue.current + changeValue.x)
  }

  const { onDragStart } = useDragPercent({
    direction: DRAG_DIRECTION.X,
    containerWidth,
    onChange: onChangeHandle,
  })
  const onBeforeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (sliderPropsWrapperValue.disabled) return
    if (isDraging.current) return
    isDraging.current = true
    sliderPropsWrapperValue.setIsDraging(true)
    const target = getTarget(e) as HTMLElement
    const isSliderMark = target?.getAttribute('data-m-slider-name') === 'slider-mark'

    if (!isSliderMark) {
      const ract = sliderDropRoot.current?.getBoundingClientRect()
      const left = ract?.left as number
      const { pageX } = getPosition(e)
      const valueRate = minus(pageX, left)
        .div(ract?.width as number)
        .mul(100)
        .toNumber()
      const value = calcValue(valueRate)
      dragInitValue.current = value
      onDragStart(e, () => {
        setTimeout(() => {
          isDraging.current = false
          sliderPropsWrapperValue.setIsDraging(false)
        }, 100)
      })
    } else {
      dragInitValue.current = currentValueRef.current
      onDragStart(e, () => {
        setTimeout(() => {
          isDraging.current = false
          sliderPropsWrapperValue.setIsDraging(false)
        }, 100)
      })
    }
  }
  return (
    <CustomSliderContext.Provider value={sliderPropsWrapperValueProxy}>
      <div
        className="h-[11px] pr-[5.5px] pl-[5.5px] select-none"
        style={{ paddingBottom: !hideLabelText ? '34px' : '0' }}
      >
        <div
          className="relative h-full w-full"
          onTouchStart={onBeforeStart}
          onMouseDown={onBeforeStart}
          ref={sliderDropRoot}
          data-name="2"
        >
          <div data-name="1" className="absolute top-1 h-[3px] w-full cursor-pointer bg-[#31333D]">
            <p
              className="h-full bg-[#3D996B]"
              style={{ width: `${sliderPropsWrapperValue.value}%` }}
            ></p>
          </div>
          <Marks />
          <SliderDropMark />
        </div>
      </div>
    </CustomSliderContext.Provider>
  )
}
