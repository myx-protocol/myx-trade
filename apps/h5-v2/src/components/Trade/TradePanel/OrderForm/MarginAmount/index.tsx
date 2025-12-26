import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { parseBigNumber } from '@/utils/bn'
import { Trans } from '@lingui/react/macro'
import { useTradePanelStore } from '../../store'
import { formatNumber } from '@/utils/number'
import useGlobalStore from '@/store/globalStore'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'

export const MarginAmountInput = () => {
  const { collateralAmount, setCollateralAmount } = useTradePanelStore()
  const { symbolInfo } = useGlobalStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

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
            {formatNumber(parseBigNumber(collateralAmount).toString(), {
              decimals: 2,
              showUnit: false,
            })}
          </p>
        </div>
      }
    >
      <div className="flex justify-between gap-[12px] leading-[1]">
        <NumberInputPrimitive
          value={collateralAmount === '0' ? '' : collateralAmount}
          onValueChange={(e) => {
            setCollateralAmount(e.value)
          }}
          className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
        />
        <div className="flex flex-shrink-0 items-center font-medium">
          <p
            className="text-[12px] text-[#00E3A5]"
            role="button"
            onClick={() => setCollateralAmount(accountAssets?.availableMargin?.toString() ?? '0')}
          >
            <Trans>Max</Trans>
          </p>
          <p className="ml-[12px] text-[12px] text-white">{symbolInfo?.quoteSymbol}</p>
        </div>
      </div>
    </InputWrapper>
  )
}
