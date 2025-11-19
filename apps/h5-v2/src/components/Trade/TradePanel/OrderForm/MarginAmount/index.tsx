import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { parseBigNumber } from '@/utils/bn'
import { Trans } from '@lingui/react/macro'
import { useTradePanelStore } from '../../store'
import { formatNumber } from '@/utils/number'
import { useTotalAvailableBalance } from '@/hooks/balance/use-total-available-balance'

export const MarginAmountInput = () => {
  const { collateralAmount, setCollateralAmount } = useTradePanelStore()
  const totalBalance = useTotalAvailableBalance()

  return (
    <InputWrapper
      className="mb-[6px]"
      title={
        <div className="flex items-center">
          <p>
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
          value={collateralAmount}
          onValueChange={(e) => {
            setCollateralAmount(e.value)
          }}
          className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
        />
        <div className="flex flex-shrink-0 items-center font-medium">
          <p
            className="text-[12px] text-[#00E3A5]"
            role="button"
            onClick={() => setCollateralAmount(totalBalance)}
          >
            <Trans>Max</Trans>
          </p>
          <p className="ml-[12px] text-[12px] text-white">USDC</p>
        </div>
      </div>
    </InputWrapper>
  )
}
