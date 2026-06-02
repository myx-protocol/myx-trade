import { useEffect, useState, useMemo, useRef } from 'react'
import { TpslTypeSelect } from './TpslTypeSelect'
import { TpSlTypeEnum } from '@/components/Trade/type'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { Slider } from '@mui/material'
import clsx from 'clsx'
import { debounce } from 'lodash-es'
import { parseBigNumber } from '@/utils/bn'
import { useOrderTPSLStore } from '../store'
import { NumberInputSourceType } from '@/components/UI/NumberInput/types'
import { t } from '@lingui/core/macro'
import { displayAmount, formatNumber } from '@/utils/number'
import { Direction } from '@myx-trade/sdk'

const AmountSliderMarks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

const renderTargetUnit = (type: TpSlTypeEnum, symbol: string) => {
  switch (type) {
    case TpSlTypeEnum.PRICE:
      return symbol
    case TpSlTypeEnum.ROI:
      return '%'
    case TpSlTypeEnum.Change:
      return '%'
    case TpSlTypeEnum.Pnl:
      return symbol
  }
}

export const TpslFormGroup = ({ order, type }: { order: any; type: 'tp' | 'sl' }) => {
  const [tpslType, setTpslType] = useState<TpSlTypeEnum>(TpSlTypeEnum.Pnl)
  const [sliderValue, setSliderValue] = useState<number>(
    type === 'tp' ? (order?.tpSize ?? order?.size ?? 0) : (order?.slSize ?? order?.size ?? 0),
  )
  const { tpSize, slSize, setTpSize, setSlSize, setTpPrice, setSlPrice } = useOrderTPSLStore()
  const [targetPrice, setTargetPrice] = useState<string>('')
  const [targetRate, setTargetRate] = useState<string>('')

  // 初始化默认值：优先使用 order.tpSize/slSize，否则使用 order.size（100%）
  useEffect(() => {
    if (order?.size) {
      if (type === 'tp') {
        const defaultValue = order.tpSize ?? order.size
        setSliderValue(defaultValue)
        setTpSize(defaultValue.toString())
      } else {
        const defaultValue = order.slSize ?? order.size
        setSliderValue(defaultValue)
        setSlSize(defaultValue.toString())
      }
    }
  }, [order?.size, order?.tpSize, order?.slSize, type, setTpSize, setSlSize])

  // 初始化触发价格和计算对应的 targetRate
  useEffect(() => {
    const initialPrice = type === 'tp' ? order?.tpPrice : order?.slPrice
    if (initialPrice && parseBigNumber(initialPrice).gt(0)) {
      setTargetPrice(initialPrice.toString())

      // 同步到 store
      if (type === 'tp') {
        setTpPrice(initialPrice.toString())
      } else {
        setSlPrice(initialPrice.toString())
      }

      // 根据 tpslType 计算 targetRate
      const triggerPrice = parseBigNumber(initialPrice)
      const entryPrice = parseBigNumber(order.price)
      const diff =
        order.direction === Direction.LONG
          ? triggerPrice.minus(entryPrice)
          : entryPrice.minus(triggerPrice)
      const collateralAmount = parseBigNumber(order.collateralAmount)

      if (tpslType === TpSlTypeEnum.PRICE) {
        setTargetRate(diff.toString())
      } else if (tpslType === TpSlTypeEnum.ROI) {
        const radio = diff.div(collateralAmount).mul(100).toFixed(2)
        setTargetRate(radio)
      } else if (tpslType === TpSlTypeEnum.Change) {
        const radio = diff.div(entryPrice).mul(100).toFixed(2)
        setTargetRate(radio)
      } else if (tpslType === TpSlTypeEnum.Pnl) {
        const pnl = parseBigNumber(order.collateralAmount).plus(diff).gte(0) ? diff.toString() : '0'
        setTargetRate(pnl)
      }
    }
  }, [
    order?.tpPrice,
    order?.slPrice,
    order?.price,
    order?.direction,
    order?.collateralAmount,
    type,
    tpslType,
    setTpPrice,
    setSlPrice,
  ])

  // 创建防抖函数
  const debouncedUpdateSize = useMemo(
    () =>
      debounce((value: number) => {
        if (type === 'tp') {
          console.log('tp value==>', value)
          setTpSize(value.toString())
        } else {
          console.log('sl value==>', value)
          setSlSize(value.toString())
        }
      }, 300),
    [type, setTpSize, setSlSize],
  )

  useEffect(() => {
    debouncedUpdateSize(sliderValue)

    // 清理函数：取消防抖
    return () => {
      debouncedUpdateSize.cancel()
    }
  }, [sliderValue, debouncedUpdateSize])

  const displayTargetPrice = useMemo(() => {
    if (!targetPrice || parseBigNumber(type === 'tp' ? tpSize : slSize).eq(0)) return '--'

    if (parseBigNumber(targetPrice).gt(parseBigNumber(order.price))) {
      return `>=${displayAmount(parseBigNumber(targetPrice).toString())} ${order?.quoteSymbol ?? ''}`
    }

    return `<=${displayAmount(parseBigNumber(targetPrice).toString())} ${order?.quoteSymbol ?? ''}`
  }, [targetPrice, order?.quoteSymbol, targetPrice, order.price, tpSize, slSize, type])

  const totalPnl = useMemo(() => {
    const size = type === 'tp' ? tpSize : slSize
    if (parseBigNumber(size).eq(0)) return '0'
    if (!targetPrice) return '0'

    const diff =
      order.direction === Direction.LONG
        ? parseBigNumber(targetPrice).minus(parseBigNumber(order.price))
        : parseBigNumber(order.price).minus(parseBigNumber(targetPrice))
    const pnl = diff.mul(parseBigNumber(size)).toString()

    return pnl
  }, [tpSize, slSize, targetPrice, order.price, type])

  return (
    <div className="mt-[20px]">
      <TpslTypeSelect
        value={tpslType}
        onChange={(val) => {
          setTpslType(val)
          setTargetPrice('')
          setTargetRate('')
        }}
        quoteToken={order?.quoteSymbol ?? ''}
      />
      {/* price & type value */}
      <div className="mt-[4px] flex items-center justify-between gap-[8px]">
        {/* trigger price */}
        <div className="flex min-h-[46px] w-[202px] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive
            className="flex-1 text-left"
            placeholder={t`触发价格`}
            autoFocus={type === 'tp'}
            value={targetPrice}
            allowLeadingZeros
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                // 将中文小数点转换为英文小数点
                const normalizedValue = value.replace(/。/g, '.')
                setTargetPrice(normalizedValue)

                // 如果输入为空或0，清空关联的计算值
                if (!normalizedValue || parseBigNumber(normalizedValue).eq(0)) {
                  setTargetRate('')
                  if (type === 'tp') {
                    setTpPrice(normalizedValue)
                  } else {
                    setSlPrice(normalizedValue)
                  }
                  return
                }

                const triggerPrice = parseBigNumber(normalizedValue)
                const entryPrice = parseBigNumber(order.price)
                const diff =
                  order.direction === Direction.LONG
                    ? triggerPrice.minus(entryPrice)
                    : entryPrice.minus(triggerPrice)
                const collateralAmount = parseBigNumber(order.collateralAmount)
                if (type === 'tp') {
                  setTpPrice(normalizedValue)
                } else {
                  setSlPrice(normalizedValue)
                }

                if (tpslType === TpSlTypeEnum.PRICE) {
                  setTargetRate(diff.toString())
                } else if (tpslType === TpSlTypeEnum.ROI) {
                  const radio = diff.div(collateralAmount).mul(100).toFixed(2)
                  setTargetRate(radio)
                } else if (tpslType === TpSlTypeEnum.Change) {
                  const radio = diff.div(entryPrice).mul(100).toFixed(2)
                  setTargetRate(radio)
                } else if (tpslType === TpSlTypeEnum.Pnl) {
                  const size = type === 'tp' ? tpSize : slSize
                  const pnl = parseBigNumber(size).eq(0)
                    ? '0'
                    : diff.mul(parseBigNumber(size)).toString()
                  setTargetRate(pnl)
                }
              }
            }}
          />
          <p className="text flex-shrink-0">{order?.quoteSymbol ?? ''}</p>
        </div>
        {/* type value */}
        <div className="flex min-h-[46px] w-[140px] flex-[1_1_0%] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive
            allowNegative={true}
            value={targetRate}
            allowLeadingZeros
            onValueChange={({ value, floatValue }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                // 用 value 保留负号输入过程（如只输入 "-" 时 floatValue 为 undefined）
                setTargetRate(value ?? floatValue?.toString() ?? '')
                if (tpslType === TpSlTypeEnum.ROI) {
                  const radio = parseBigNumber(floatValue ?? 0).div(100)
                  const totalPnl = parseBigNumber(order.collateralAmount).mul(radio)
                  const averagePnl = totalPnl
                    .div(parseBigNumber(order.size))
                    .mul(order.direction === Direction.LONG ? 1 : -1)
                  const targetPrice = parseBigNumber(order.price).plus(averagePnl).toFixed(6)
                  setTargetPrice(targetPrice)
                } else if (tpslType === TpSlTypeEnum.Change) {
                  const radio = parseBigNumber(1).plus(parseBigNumber(floatValue ?? 0).div(100))
                  const targetPrice = parseBigNumber(order.price).mul(radio).toFixed(6)
                  setTargetPrice(targetPrice)
                } else if (tpslType === TpSlTypeEnum.Pnl) {
                  const totalPnl = parseBigNumber(floatValue ?? 0)
                  const averagePnl = totalPnl
                    .div(parseBigNumber(order.size))
                    .mul(order.direction === Direction.LONG ? 1 : -1)
                  const targetPrice = parseBigNumber(order.price).plus(averagePnl).toFixed(6)
                  setTargetPrice(targetPrice)
                }
                if (type === 'tp') {
                  setTpPrice(targetPrice)
                } else {
                  setSlPrice(targetPrice)
                }
              }
            }}
            className="flex-1 text-left"
            placeholder={renderTargetUnit(tpslType, order?.quoteSymbol ?? '')}
          />
          <p className="text flex-shrink-0">
            {renderTargetUnit(tpslType, order?.quoteSymbol ?? '')}
          </p>
        </div>
      </div>
      <div className="mt-[8px] flex min-h-[46px] w-full items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
        <NumberInputPrimitive
          value={type === 'tp' ? tpSize : slSize}
          className="flex-1 text-left"
          placeholder={t`数量`}
          allowLeadingZeros
          onValueChange={({ value, floatValue }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              // 将中文小数点转换为英文小数点
              const normalizedValue = value.replace(/。/g, '.')

              // 输入时不做限制，直接保存用户输入的值
              if (type === 'tp') {
                setTpSize(normalizedValue)
              } else {
                setSlSize(normalizedValue)
              }

              // 更新滑块位置（滑块的值是实际数量，不是百分比）
              const numValue = floatValue ?? 0
              setSliderValue(numValue)
              return
            }
          }}
          onBlur={() => {
            // 失去焦点时检查是否超过最大值
            const currentValue = type === 'tp' ? tpSize : slSize
            const inputValue = Number(currentValue)
            const maxSize = Number(order.size)

            if (inputValue > maxSize) {
              const finalValue = maxSize.toString()
              if (type === 'tp') {
                setTpSize(finalValue)
              } else {
                setSlSize(finalValue)
              }
              setSliderValue(maxSize)
            }
          }}
        />
        <p className="text flex-shrink-0">{order?.baseSymbol ?? ''}</p>
      </div>
      <div className="mt-[8px]">
        <div className="px-[8px]">
          <Slider
            value={sliderValue}
            onChange={(_, newValue) => setSliderValue(newValue as number)}
            min={0}
            step={parseBigNumber(order.size).div(100).toNumber()}
            max={order.size}
            valueLabelDisplay="auto"
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              height: '12px',
              borderRadius: '9px',
              padding: 0,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                background: '#fff',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              '& .MuiSlider-rail': {
                opacity: 1,
                background: '#272830',
                borderRadius: 9,
                boxSizing: 'border-box',
              },
              '& .MuiSlider-track': {
                background: 'linear-gradient(90deg, #4cb86a 0%, #3ba07b 100%)',
                borderRadius: 9,
              },
              '@media (pointer: coarse)': {
                padding: '0px!important',
              },
            }}
          />
        </div>
        <div className="mt-[6px] flex justify-between">
          {AmountSliderMarks.map((m) => {
            // 计算当前滑块值对应的百分比
            const currentPercentage = (sliderValue / Number(order.size)) * 100
            return (
              <p
                key={m.value}
                className={clsx(
                  'text-center text-[10px] font-medium',
                  currentPercentage >= m.value ? 'text-white' : 'text-[#4D515C]',
                )}
              >
                {m.label}
              </p>
            )
          })}
        </div>
      </div>
      {/* tips */}
      <p className="mt-[8px] text-[12px] leading-[1.5] font-medium text-[#848E9C]">
        <Trans>
          当最新价格 <span className="text-white">{displayTargetPrice}</span> 时，将以市价平仓, 数量
          {type === 'tp' ? formatNumber(tpSize) : formatNumber(slSize)} {order?.baseSymbol ?? ''}
          ,预期收益
          <span
            className="ml-[2px]"
            style={{
              color: parseBigNumber(totalPnl).eq(0)
                ? 'white'
                : parseBigNumber(totalPnl).toNumber() > 0
                  ? '#00E3A5'
                  : '#EC605A',
            }}
          >
            {formatNumber(totalPnl)} {order?.quoteSymbol ?? ''}
          </span>
        </Trans>
      </p>
    </div>
  )
}
