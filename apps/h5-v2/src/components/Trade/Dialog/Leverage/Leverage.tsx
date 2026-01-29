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

function LeverageDialogContent() {
  const { chainId: currChainId } = useWalletConnection()
  const chainId = getAsSupportedChainIdFn(currChainId)
  const { symbolInfo, maxLeverage } = useGlobalStore()
  const { close, setLeverage } = useLeverageDialogStore()
  const leverage = useLeverage(symbolInfo?.poolId)

  // 写死的变量
  const minLeverage = MIN_LEVERAGE
  // const maxLeverage = MAX_LEVERAGE
  const [leverageInput, setLeverageInput] = useState(leverage)
  const [leverageInputString, setLeverageInputString] = useState(leverage.toString())

  const handleClickSureChange = useCallback(() => {
    setLeverage(chainId as ChainId, symbolInfo?.poolId ?? '', leverageInput)

    close()
  }, [leverageInput, close, setLeverage, symbolInfo?.poolId])

  // watch symbol leverage change
  useUpdateEffect(() => {
    setLeverageInput(leverage)
    setLeverageInputString(leverage.toString())
  }, [leverage])

  const marks = useMemo(() => {
    const MARKS_LENGTH = 6
    return Array.from({ length: MARKS_LENGTH }).map((_, index) => {
      const value =
        minLeverage + Math.floor(((maxLeverage - minLeverage) * index) / (MARKS_LENGTH - 1))
      return {
        value,
        label: `${value}x`,
      }
    })
  }, [minLeverage, maxLeverage])

  const handleDecrease = useCallback(() => {
    if (leverageInput > minLeverage) {
      const newLeverage = leverageInput - 1
      setLeverageInput(newLeverage)
      setLeverageInputString(newLeverage.toString())
    }
  }, [leverageInput, minLeverage])

  const handleIncrease = useCallback(() => {
    if (leverageInput < maxLeverage) {
      const newLeverage = leverageInput + 1
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
    setLeverageInput(value)
    setLeverageInputString(value.toString())
  }, [])

  return (
    <div className="flex flex-col">
      {/* 杠杆输入区域 */}
      <div className="">
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
      <div className="mt-[12px]">
        <CustomSlider
          value={leverageInput}
          marks={marks}
          min={minLeverage}
          max={maxLeverage}
          onChange={handleSliderChange}
        />
      </div>

      {/* 说明文字 */}
      <div className="mt-[20px] text-[12px] leading-[1.2] font-normal text-[#848E9C]">
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
