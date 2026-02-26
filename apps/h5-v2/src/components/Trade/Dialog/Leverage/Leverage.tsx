import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useCallback, useMemo, useState } from 'react'
import { useLeverageDialogStore } from './store'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { NumberInputSourceType } from '@/components/UI/NumberInput/types'
import { CustomSlider } from '@/components/UI/Slider/CustomSlider'
import Add from '@/components/Icon/set/Add'
import Sub from '@/components/Icon/set/Sub'
import PrimaryButton from '@/components/UI/Button/PrimaryButton'
import clsx from 'clsx'
import { useLeverage } from '../../hooks/useLeverage'
import { useUpdateEffect } from 'ahooks'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { ChainId, getAsSupportedChainIdFn } from '@/config/chain'
import useGlobalStore from '@/store/globalStore'

// 写死的常量
const LEVERAGE_RISK_WARNING = 10
const MIN_LEVERAGE = 1
const LEVERAGE_STEP = 1 // 滑动步长始终为1

/**
 * 生成刻度标记的杠杆值（用于显示）
 * @param min - 最小杠杆
 * @param max - 最大杠杆
 * @returns 刻度标记的杠杆值数组
 */
const generateValidLeverages = (min: number, max: number): number[] => {
  const leverages: number[] = []

  if (max <= 20) {
    // 1x-20x: 显示 1x, 2x, 3x, 5x, 10x, 15x, 20x
    const marks = [1, 2, 3, 5, 10, 15, 20]
    for (const mark of marks) {
      if (mark >= min && mark <= max) {
        leverages.push(mark)
      }
    }
  } else if (max <= 50) {
    // 20-50x: 每个刻度相差5x (1x, 5x, 10x, 15x, 20x, 25x, 30x, 35x, 40x, 45x, 50x)
    leverages.push(1)
    for (let i = 5; i <= max; i += 5) {
      leverages.push(i)
    }
  } else if (max <= 100) {
    // 50-100x: 每个刻度相差10x (1x, 10x, 20x, 30x, 40x, 50x, 60x, 70x, 80x, 90x, 100x)
    leverages.push(1)
    for (let i = 10; i <= max; i += 10) {
      leverages.push(i)
    }
  } else {
    // 大于100x: 共5个刻度，每个相差20x
    leverages.push(1)
    const step = 20
    for (let i = step; i <= max; i += step) {
      leverages.push(i)
    }
    // 确保最大值被包含
    if (leverages[leverages.length - 1] !== max) {
      leverages.push(max)
    }
  }

  return leverages
}

/**
 * 获取下一个杠杆值（增加）- 步长为1
 */
const getNextLeverage = (current: number, max: number): number => {
  if (current >= max) return max
  return Math.min(current + LEVERAGE_STEP, max)
}

/**
 * 获取上一个杠杆值（减少）- 步长为1
 */
const getPrevLeverage = (current: number, min: number): number => {
  if (current <= min) return min
  return Math.max(current - LEVERAGE_STEP, min)
}

/**
 * 生成滑块的刻度标记
 */
const generateMarks = (min: number, max: number) => {
  const validLeverages = generateValidLeverages(min, max)

  return validLeverages.map((value) => ({
    value,
    label: `${value}x`,
  }))
}

function LeverageDialogContent() {
  const { chainId: currChainId } = useWalletConnection()
  const chainId = getAsSupportedChainIdFn(currChainId)
  const { symbolInfo, poolConfig } = useGlobalStore()
  const { close, setLeverage } = useLeverageDialogStore()
  const leverage = useLeverage(symbolInfo?.poolId)

  const maxLeverage = poolConfig?.levelConfig?.leverage ?? 10
  const minLeverage = MIN_LEVERAGE
  const [leverageInput, setLeverageInput] = useState(leverage)
  const [leverageInputString, setLeverageInputString] = useState(leverage.toString())

  const handleClickSureChange = useCallback(() => {
    setLeverage(chainId as ChainId, symbolInfo?.poolId ?? '', leverageInput)

    close()
  }, [leverageInput, close, setLeverage, symbolInfo?.poolId, chainId])

  // watch symbol leverage change
  useUpdateEffect(() => {
    setLeverageInput(leverage)
    setLeverageInputString(leverage.toString())
  }, [leverage])

  // 生成滑块刻度
  const marks = useMemo(() => {
    return generateMarks(minLeverage, maxLeverage)
  }, [minLeverage, maxLeverage])

  const handleDecrease = useCallback(() => {
    if (leverageInput > minLeverage) {
      const newLeverage = getPrevLeverage(leverageInput, minLeverage)
      setLeverageInput(newLeverage)
      setLeverageInputString(newLeverage.toString())
    }
  }, [leverageInput, minLeverage])

  const handleIncrease = useCallback(() => {
    if (leverageInput < maxLeverage) {
      const newLeverage = getNextLeverage(leverageInput, maxLeverage)
      setLeverageInput(newLeverage)
      setLeverageInputString(newLeverage.toString())
    }
  }, [leverageInput, maxLeverage])

  const handleInputChange = useCallback(
    (
      { floatValue = 0, value }: { floatValue?: number; value: string },
      { source }: { source: NumberInputSourceType },
    ) => {
      if (source === NumberInputSourceType.EVENT) {
        setLeverageInputString(value)

        const clampedValue = Math.max(minLeverage, Math.min(maxLeverage, floatValue))
        setLeverageInput(clampedValue)
      }
    },
    [minLeverage, maxLeverage],
  )

  const handleInputBlur = useCallback(() => {
    const clampedValue = Math.max(minLeverage, Math.min(maxLeverage, leverageInput))
    setLeverageInputString(clampedValue.toString())
  }, [leverageInput, minLeverage, maxLeverage])

  const handleSliderChange = useCallback(({ value }: { value: number }) => {
    // 步长为1，直接使用整数值
    const intValue = Math.round(value)
    setLeverageInput(intValue)
    setLeverageInputString(intValue.toString())
  }, [])

  return (
    <div className="flex flex-col">
      {/* 杠杆输入区域 */}
      <div className="px-[20px]">
        <div className="mt-[24px] flex items-center gap-[10px] rounded-lg border border-[#31333D] bg-[#18191F] px-[16px] py-[12px]">
          {/* 减少按钮 */}
          <div
            className={clsx('flex items-center rounded-[9999px] p-[2px] select-none', {
              'pointer-events-none cursor-not-allowed opacity-50': leverageInput <= minLeverage,
            })}
            role="button"
            onClick={handleDecrease}
          >
            <Sub size={20} color="#2D3138" />
          </div>

          {/* 数字输入框 */}
          <div className="flex-1">
            <NumberInputPrimitive
              inputMode={'decimal'}
              suffix="x"
              value={leverageInputString}
              className="text-center text-[16px] leading-[1]"
              thousandSeparator={false}
              decimalScale={0}
              onBlur={handleInputBlur}
              onValueChange={handleInputChange}
            />
          </div>

          {/* 增加按钮 */}
          <div
            className={clsx('flex items-center rounded-[9999px] p-[2px] select-none', {
              'pointer-events-none cursor-not-allowed opacity-50': leverageInput >= maxLeverage,
            })}
            role="button"
            onClick={handleIncrease}
          >
            <Add size={20} color="#2D3138" />
          </div>
        </div>
      </div>

      {/* 滑块区域 */}
      <div className="mt-[12px] px-[20px]">
        <CustomSlider
          value={leverageInput}
          marks={marks}
          min={minLeverage}
          max={maxLeverage}
          onChange={handleSliderChange}
        />
      </div>

      {/* 说明文字 */}
      <div className="mt-[20px] px-[20px] text-[12px] leading-[1.2] font-normal text-[#848E9C]">
        <Trans>
          Leverage adjustments will impact your new opening orders. When opening a new position,
          your minimum maintenance margin will be calculated according to the new leverage
        </Trans>
      </div>

      {/* 风险警告 */}
      <div className="px-[20px]">
        {leverageInput > LEVERAGE_RISK_WARNING && (
          <div className="mt-[8px] text-[12px] leading-[1.2] font-normal text-[#EC605A]">
            <Trans>
              Opting for a leverage higher than [10x] elevates your risks for liquidation. Please
              exercise caution with the associated risks Confirm
            </Trans>
          </div>
        )}
      </div>

      {/* 确认按钮 */}
      <div className="px-[20px]">
        <PrimaryButton
          className="mt-[20px]! h-[44px] w-full rounded-[9999px]!"
          onClick={handleClickSureChange}
        >
          <Trans>Confirm</Trans>
        </PrimaryButton>
      </div>
    </div>
  )
}

export const LeverageDialog = () => {
  const { isOpen, close } = useLeverageDialogStore()
  return (
    <DialogBase
      title={t`Adjust Leverage`}
      open={isOpen}
      onClose={close}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '390px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <LeverageDialogContent />
    </DialogBase>
  )
}
