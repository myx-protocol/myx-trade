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
import { useGetNetworkFee } from '@/hooks/calculate/use-get-liq-price'
import useSWR from 'swr'
import {
  getOpenOrderNetworkFeeReserveQuote,
  subtractReserveFromAvailable,
} from '@/utils/trade/open-order-network-fee-reserve'

export const MarginAmountInput = () => {
  const { collateralAmount, setCollateralAmount, tpSlOpen, tpValue, slValue } = useTradePanelStore()
  const { symbolInfo } = useGlobalStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const { getNetworkFee } = useGetNetworkFee({
    poolId: symbolInfo?.poolId as string,
    chainId: symbolInfo?.chainId ?? 0,
  })
  const { data: networkFee } = useSWR(
    symbolInfo?.poolId && symbolInfo?.chainId
      ? {
          key: 'getNetworkFee',
          poolId: symbolInfo.poolId as string,
          chainId: symbolInfo.chainId ?? 0,
        }
      : null,
    async () => await getNetworkFee(),
  )

  const availableRaw = accountAssets?.availableMargin?.toString() ?? '0'
  const networkFeeReserve = getOpenOrderNetworkFeeReserveQuote(
    parseBigNumber(networkFee ?? 0).toString(),
    tpSlOpen,
    tpValue,
    slValue,
  )
  const maxCollateral = subtractReserveFromAvailable(availableRaw, networkFeeReserve)
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

  useEffect(() => {
    const maxBn = parseBigNumber(normalizedMaxCollateral)
    const storeBn = parseBigNumber(collateralAmount || '0')
    const inputBn = parseBigNumber(inputCollateral || '0')
    if (storeBn.gt(maxBn) || inputBn.gt(maxBn)) {
      debouncedSetCollateralAmount.cancel()
      setCollateralAmount(normalizedMaxCollateral)
      setInputCollateral(normalizedMaxCollateral)
    }
  }, [
    normalizedMaxCollateral,
    collateralAmount,
    inputCollateral,
    setCollateralAmount,
    debouncedSetCollateralAmount,
  ])

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
