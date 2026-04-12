import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { parseBigNumber } from '@/utils/bn'
import { Trans } from '@lingui/react/macro'
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash-es'
import { useTradePanelStore } from '../../store'
import { formatNumber } from '@/utils/number'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import useGlobalStore from '@/store/globalStore'

export const MarginAmountInput = () => {
  const { collateralAmount, setCollateralAmount } = useTradePanelStore()
  const { symbolInfo } = useGlobalStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const maxCollateral = accountAssets?.availableMargin?.toString() ?? '0'
  const normalizedMaxCollateral = parseBigNumber(maxCollateral).toString()

  const [inputCollateral, setInputCollateral] = useState(collateralAmount)

  const debouncedSetCollateralAmount = useMemo(
    () => debounce((value: string) => setCollateralAmount(value), 300),
    [setCollateralAmount],
  )

  useEffect(() => {
    return () => {
      debouncedSetCollateralAmount.cancel()
    }
  }, [debouncedSetCollateralAmount])

  useEffect(() => {
    setInputCollateral(collateralAmount)
  }, [collateralAmount])

  return (
    <InputWrapper
      className="mb-[6px]"
      title={
        <div className="flex items-center">
          <p className="text-[#CED1D9]">
            <Trans>Pay</Trans>
          </p>
          <p className="ml-[4px]">
            $
            {formatNumber(parseBigNumber(inputCollateral || '0').toString(), {
              decimals: 2,
              showUnit: false,
            })}
          </p>
        </div>
      }
    >
      <div className="flex justify-between gap-[12px] leading-[1]">
        <NumberInputPrimitive
          value={inputCollateral === '0' ? '0.0' : inputCollateral}
          onValueChange={(e) => {
            const nextValue = parseBigNumber(e.value || '0').gt(
              parseBigNumber(normalizedMaxCollateral),
            )
              ? normalizedMaxCollateral
              : e.value

            setInputCollateral(nextValue)
            debouncedSetCollateralAmount(nextValue)
          }}
          className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
        />
        <div className="flex flex-shrink-0 items-center font-medium">
          <p
            className="text-[12px] text-[#00E3A5]"
            role="button"
            onClick={() => {
              debouncedSetCollateralAmount.cancel()
              setCollateralAmount(normalizedMaxCollateral)
              setInputCollateral(normalizedMaxCollateral)
            }}
          >
            <Trans>Max</Trans>
          </p>
          <p className="ml-[12px] text-[12px] text-white">{symbolInfo?.quoteSymbol}</p>
        </div>
      </div>
    </InputWrapper>
  )
}
