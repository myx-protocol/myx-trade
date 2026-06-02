import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { TradeSelect } from '@/components/Trade/components/Select'
import { AmountUnitEnum, PositionActionEnum } from '@/components/Trade/type'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Slider, TextField, Tooltip } from '@mui/material'
import { useTradePanelStore } from '../../store'
import { parseBigNumber } from '@/utils/bn'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import useGlobalStore from '@/store/globalStore'
import { useGetCloseAvailable } from '@/hooks/available/use-get-close-available'
import { useGetOpenAvailable } from '@/hooks/available/use-get-open-available'

const ValueLabelComponent = (props: any) => {
  const { children, value } = props
  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={
        <span
          style={{
            background: '#fff',
            color: '#101114',
            fontWeight: 500,
            fontSize: '12px',
            borderRadius: '4px',
            padding: '4px 8px',
            boxShadow: '0 2px 8px 0 #18191c',
            minWidth: '40px',
            minHeight: '20px',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {value}%
        </span>
      }
      slotProps={{
        tooltip: {
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            p: 0,
            mt: -2,
          },
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8],
              },
            },
          ],
        },
      }}
    >
      {children}
    </Tooltip>
  )
}

const AmountSliderMarks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

export const AmountInput = () => {
  const { symbolInfo } = useGlobalStore()
  const [useSlider, setUseSlider] = useState(false)
  const {
    collateralAmount,
    setLongSize,
    setShortSize,
    price,
    autoMarginMode,
    amountUnit,
    setAmountUnit,
    positionAction,
    amountSliderValue: sliderValue,
    setAmountSliderValue: setSliderValue,
    setTempInputValue,
    tempInputValue,
  } = useTradePanelStore()
  const leverage = useLeverage(symbolInfo?.poolId)
  const { maxCloseLong, maxCloseShort } = useGetCloseAvailable()
  const { maxOpenLong, maxOpenShort } = useGetOpenAvailable()

  useEffect(() => {
    if (!useSlider) return
    if (positionAction === PositionActionEnum.OPEN) {
      if (autoMarginMode) {
        if (amountUnit === AmountUnitEnum.QUOTE) {
          const longSize = parseBigNumber(sliderValue)
            .div(100)
            .mul(parseBigNumber(maxOpenLong.quoteAmount))
            .toString()
          const shortSize = parseBigNumber(sliderValue)
            .div(100)
            .mul(parseBigNumber(maxOpenShort.quoteAmount))
            .toString()

          setLongSize(longSize)
          setShortSize(shortSize)
        } else {
          const longSize = parseBigNumber(sliderValue)
            .div(100)
            .mul(parseBigNumber(maxOpenLong.baseAmount))
            .toString()
          const shortSize = parseBigNumber(sliderValue)
            .div(100)
            .mul(parseBigNumber(maxOpenShort.baseAmount))
            .toString()

          setLongSize(longSize)
          setShortSize(shortSize)
        }
      } else {
        const balance = parseBigNumber(collateralAmount).mul(parseBigNumber(leverage)).toString()

        if (amountUnit === AmountUnitEnum.QUOTE) {
          const openSize = parseBigNumber(sliderValue)
            .div(100)
            .mul(parseBigNumber(balance))
            .toString()

          setLongSize(openSize)
          setShortSize(openSize)
        } else {
          if (parseBigNumber(price).eq(0)) {
            setLongSize('0')
            setShortSize('0')
          } else {
            const maxSize = parseBigNumber(balance).div(parseBigNumber(price)).toString()
            const openSize = parseBigNumber(sliderValue)
              .div(100)
              .mul(parseBigNumber(maxSize))
              .toString()

            setLongSize(openSize)
            setShortSize(openSize)
          }
        }
      }
      return
    }
    if (amountUnit === AmountUnitEnum.QUOTE) {
      const longSize = parseBigNumber(sliderValue)
        .div(100)
        .mul(parseBigNumber(maxCloseLong.quoteAmount))
        .toString()
      const shortSize = parseBigNumber(sliderValue)
        .div(100)
        .mul(parseBigNumber(maxCloseShort.quoteAmount))
        .toString()

      setLongSize(longSize)
      setShortSize(shortSize)
    } else {
      const longSize = parseBigNumber(sliderValue)
        .div(100)
        .mul(parseBigNumber(maxCloseLong.baseAmount))
        .toString()
      const shortSize = parseBigNumber(sliderValue)
        .div(100)
        .mul(parseBigNumber(maxCloseShort.baseAmount))
        .toString()

      setLongSize(longSize)
      setShortSize(shortSize)
    }
  }, [
    sliderValue,
    useSlider,
    setLongSize,
    setShortSize,
    positionAction,
    autoMarginMode,
    amountUnit,
    collateralAmount,
    leverage,
    price,
  ])

  return (
    <InputWrapper
      className="mb-[6px]"
      title={
        <div className="flex items-center">
          <p className="text-[#CED1D9]">
            <Trans>Amount</Trans>
          </p>
        </div>
      }
    >
      <div className="flex justify-between gap-[12px] leading-[1]">
        <div className="flex-grow-[1]">
          {useSlider ? (
            <TextField
              variant="standard"
              value={`${sliderValue}%`}
              onFocus={() => {
                setUseSlider(false)
                setSliderValue(0)
              }}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                flex: 1,
                background: 'transparent',
                mr: 2,
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'transparent',
                  p: 0,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#6D7180',
                  opacity: 1,
                  fontSize: '18px',
                  fontWeight: 500,
                },
              }}
            />
          ) : (
            <NumberInputPrimitive
              value={tempInputValue}
              className="w-full text-[20px] font-bold text-[#fff]"
              decimalScale={6}
              onFocus={() => {
                setUseSlider(false)
                setSliderValue(0)
                setLongSize('0')
                setShortSize('0')
                setTempInputValue('')
              }}
              onValueChange={({ value }) => {
                setLongSize(value)
                setShortSize(value)
                setTempInputValue(value)
              }}
              thousandSeparator=","
              inputMode="decimal"
              placeholder={'0'}
            />
          )}
        </div>
        <div className="flex flex-shrink-0 items-center font-medium">
          <TradeSelect
            value={amountUnit}
            onChange={(value) => {
              const amountUnit = value.target.value as AmountUnitEnum
              setAmountUnit(amountUnit)
              setLongSize('0')
              setShortSize('0')
              setSliderValue(0)
              setTempInputValue('')
            }}
            options={[
              { label: symbolInfo?.baseSymbol, value: AmountUnitEnum.BASE },
              { label: symbolInfo?.quoteSymbol, value: AmountUnitEnum.QUOTE },
            ]}
          />
        </div>
      </div>
      <div className="mt-[12px]">
        <Slider
          value={sliderValue}
          onChange={(_, newValue) => {
            setUseSlider(true)
            setSliderValue(newValue as number)
          }}
          min={0}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          slots={{
            valueLabel: ValueLabelComponent,
          }}
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
    </InputWrapper>
  )
}
