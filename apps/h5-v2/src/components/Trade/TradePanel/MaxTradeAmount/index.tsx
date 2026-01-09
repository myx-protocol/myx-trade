import { Tooltips } from '@/components/UI/Tooltips'
import { displayAmount } from '@/utils/number'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useGetOpenAvailable } from '@/hooks/available/use-get-open-available'
import { useTradePanelStore } from '../store'
import { AmountUnitEnum, PositionActionEnum } from '../../type'
import { memo } from 'react'
import { useGetCloseAvailable } from '@/hooks/available/use-get-close-available'
// import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
// import Big from 'big.js'
import useGlobalStore from '@/store/globalStore'

export const MaxTradeAmount = memo(() => {
  const openAvailable = useGetOpenAvailable()
  const { maxCloseLong, maxCloseShort } = useGetCloseAvailable()
  const { amountUnit, positionAction } = useTradePanelStore()
  const { symbolInfo } = useGlobalStore()
  // const { poolConfig } = useGetPoolConfig(
  //   symbolInfo?.poolId as string,
  //   symbolInfo?.chainId as number,
  // )
  // const minOrderSize = poolConfig?.levelConfig?.minOrderSizeInUsd ?? 0

  // 直接计算，不使用 useMemo
  const isOpenAction = positionAction === PositionActionEnum.OPEN
  const isBaseUnit = amountUnit === AmountUnitEnum.BASE

  let maxLongAmount = '0'
  let maxShortAmount = '0'

  if (isOpenAction) {
    // 开仓：直接使用预先格式化好的值
    const longAmount = isBaseUnit
      ? openAvailable.maxOpenLong.baseAmount
      : openAvailable.maxOpenLong.quoteAmount
    const shortAmount = isBaseUnit
      ? openAvailable.maxOpenShort.baseAmount
      : openAvailable.maxOpenShort.quoteAmount
    maxLongAmount = displayAmount(longAmount)
    maxShortAmount = displayAmount(shortAmount)
    // maxLongAmount = displayAmount(Big(longAmount).gte(minOrderSize) ? longAmount : '0')
    // maxShortAmount = displayAmount(Big(shortAmount).gte(minOrderSize) ? shortAmount : '0')
  } else {
    // 平仓：需要格式化
    const longAmount = isBaseUnit ? maxCloseLong.baseAmount : maxCloseLong.quoteAmount
    const shortAmount = isBaseUnit ? maxCloseShort.baseAmount : maxCloseShort.quoteAmount
    maxLongAmount = displayAmount(longAmount)
    maxShortAmount = displayAmount(shortAmount)
    // maxLongAmount = displayAmount(Big(longAmount).gte(minOrderSize) ? longAmount : '0')
    // maxShortAmount = displayAmount(Big(shortAmount).gte(minOrderSize) ? shortAmount : '0')
  }

  return (
    <div className="mt-[12px] flex justify-between gap-[12px] text-[12px] leading-[1] font-medium text-white">
      <div className="flex w-full min-w-0 gap-[4px]">
        <Tooltips
          title={t`The maximum number of positions you are allowed to open, determined by factors such as your slippage settings and current market liquidity.`}
        >
          <p className="flex-shrink-0 border-b-[1px] border-dashed border-[#848E9C] font-normal text-[#848E9C]">
            <Trans>Max</Trans>
          </p>
        </Tooltips>
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {maxLongAmount}{' '}
          {amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}
        </p>
      </div>
      <div className="flex w-full min-w-0 justify-end gap-[4px]">
        <Tooltips
          title={t`The maximum number of positions you are allowed to open, determined by factors such as your slippage settings and current market liquidity.`}
        >
          <p className="flex-shrink-0 border-b-[1px] border-dashed border-[#848E9C] font-normal text-[#848E9C]">
            <Trans>Max</Trans>
          </p>
        </Tooltips>
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {maxShortAmount}{' '}
          {amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}
        </p>
      </div>
    </div>
  )
})
