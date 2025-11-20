import { useEffect, useState, useMemo } from 'react'
import { TpslTypeSelect } from './TpslTypeSelect'
import { TpSlTypeEnum } from '@/components/Trade/type'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { Slider } from '@mui/material'
import clsx from 'clsx'
import { debounce } from 'lodash-es'
import { useTradePageStore } from '../../../store/TradePageStore'
import { parseBigNumber } from '@/utils/bn'
import { usePositionTPSLStore } from '../store'
import { NumberInputSourceType } from '@/components/UI/NumberInput/types'
import { t } from '@lingui/core/macro'
import { formatNumber } from '@/utils/number'
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

export const TpslFormGroup = ({ position, type }: { position: any; type: 'tp' | 'sl' }) => {
  const [tpslType, setTpslType] = useState<TpSlTypeEnum>(TpSlTypeEnum.PRICE)
  const [sliderValue, setSliderValue] = useState<number>(0)
  const { symbolInfo } = useTradePageStore()
  const { tpSize, slSize, setTpSize, setSlSize, setTpPrice, setSlPrice } = usePositionTPSLStore()
  const [targetPrice, setTargetPrice] = useState<string>('')
  const [targetRate, setTargetRate] = useState<string>('')

  // 创建防抖函数
  const debouncedUpdateSize = useMemo(
    () =>
      debounce((value: number) => {
        if (type === 'tp') {
          setTpSize(value.toString())
        } else {
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

    if (parseBigNumber(targetPrice).gt(parseBigNumber(position.entryPrice))) {
      return `>=${parseBigNumber(targetPrice).toString()} ${symbolInfo?.quoteSymbol ?? ''}`
    }

    return `<=${parseBigNumber(targetPrice).toString()} ${symbolInfo?.quoteSymbol ?? ''}`
  }, [targetPrice, symbolInfo?.quoteSymbol, targetPrice, position.entryPrice, tpSize, slSize])

  const totalPnl = useMemo(() => {
    const size = type === 'tp' ? tpSize : slSize
    if (parseBigNumber(size).eq(0)) return '0'
    if (!targetPrice) return '0'

    const diff = parseBigNumber(targetPrice).minus(parseBigNumber(position.entryPrice))
    const pnl = diff.mul(parseBigNumber(size)).toString()

    return pnl
  }, [tpSize, slSize, targetPrice, position.entryPrice, type])

  return (
    <div className="mt-[20px]">
      <TpslTypeSelect
        value={tpslType}
        onChange={(val) => {
          setTpslType(val)
          setTargetPrice('')
          setTargetRate('')
        }}
        quoteToken={symbolInfo?.quoteSymbol ?? ''}
      />
      {/* price & type value */}
      <div className="mt-[4px] flex items-center justify-between gap-[8px]">
        {/* trigger price */}
        <div className="flex min-h-[46px] w-[202px] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive
            // allowNegative={tpslType !== TpSlTypeEnum.PRICE}
            className="flex-1 text-left"
            placeholder={t`Trigger Price`}
            value={targetPrice}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                if (parseBigNumber(value).eq(0)) {
                  setTargetPrice('')
                  setTargetRate('')
                  return
                }
                setTargetPrice(value)
                const triggerPrice = parseBigNumber(value)
                const entryPrice = parseBigNumber(position.entryPrice)
                const diff =
                  position.direction === Direction.LONG
                    ? triggerPrice.minus(entryPrice)
                    : entryPrice.minus(triggerPrice)
                const collateralAmount = parseBigNumber(position.collateralAmount)
                if (type === 'tp') {
                  setTpPrice(value)
                } else {
                  setSlPrice(value)
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
                  const radio = diff.div(collateralAmount).mul(100).toFixed(2)
                  setTargetRate(radio)
                }
                return
              }
            }}
          />
          <p className="text flex-shrink-0">{symbolInfo?.quoteSymbol ?? ''}</p>
        </div>
        {/* type value */}
        <div className="flex min-h-[46px] w-[140px] flex-[1_1_0%] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive
            allowNegative={true}
            value={targetRate}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setTargetRate(value)
                return
              }
            }}
            className="flex-1 text-left"
            placeholder={t`Change`}
          />
          <p className="text flex-shrink-0">
            {renderTargetUnit(tpslType, symbolInfo?.quoteSymbol ?? '')}
          </p>
        </div>
      </div>
      <div className="mt-[8px] flex min-h-[46px] w-full items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
        <NumberInputPrimitive
          value={type === 'tp' ? tpSize : slSize}
          className="flex-1 text-left"
          placeholder="Amount"
          onValueChange={({ value }, { source }) => {
            if (source === NumberInputSourceType.EVENT) {
              if (type === 'tp') {
                setTpSize(value)
              } else {
                setSlSize(value)
              }
              const sliderValue = parseBigNumber(value)
                .div(parseBigNumber(position.size))
                .div(100)
                .toNumber()
              setSliderValue(sliderValue)
              return
            }
          }}
        />
        <p className="text flex-shrink-0">{symbolInfo?.baseSymbol ?? ''}</p>
      </div>
      <div className="mt-[8px]">
        <div className="px-[8px]">
          <Slider
            value={sliderValue}
            onChange={(_, newValue) => setSliderValue(newValue as number)}
            min={0}
            step={parseBigNumber(position.size).div(100).toNumber()}
            max={position.size}
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
          {AmountSliderMarks.map((m) => (
            <p
              key={m.value}
              className={clsx(
                'text-center text-[10px] font-medium',
                sliderValue >= m.value ? 'text-white' : 'text-[#4D515C]',
              )}
            >
              {m.label}
            </p>
          ))}
        </div>
      </div>
      {/* tips */}
      <p className="mt-[8px] text-[12px] leading-[1.5] font-medium text-[#848E9C]">
        <Trans>
          当最新价格 <span className="text-white">{displayTargetPrice}</span> 时，将以{' '}
          {parseBigNumber(targetPrice).toString()} {symbolInfo?.quoteSymbol ?? ''} 平仓, 数量
          {type === 'tp' ? formatNumber(tpSize) : formatNumber(slSize)}{' '}
          {symbolInfo?.baseSymbol ?? ''},预期收益
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
            {formatNumber(totalPnl)}
            {symbolInfo?.quoteSymbol ?? ''}
          </span>
        </Trans>
      </p>
    </div>
  )
}
