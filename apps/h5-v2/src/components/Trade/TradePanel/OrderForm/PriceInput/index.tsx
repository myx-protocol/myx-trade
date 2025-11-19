import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { TradeSelect } from '@/components/Trade/components/Select'
import { OrderTypeEnum } from '@/components/Trade/type'
import { useTradePanelStore } from '../../store'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useEffect } from 'react'
import { OrderType } from '@myx-trade/sdk'

export const PriceInput = () => {
  const { orderType, setOrderType, price, setPrice } = useTradePanelStore()
  const { oraclePriceData } = useMarketStore()
  const { symbolInfo } = useTradePageStore()
  const marketPrice = oraclePriceData[symbolInfo?.poolId as string]?.price ?? 0

  useEffect(() => {
    if (orderType === OrderType.MARKET) {
      setPrice(marketPrice.toString())
    }
  }, [orderType, marketPrice])

  return (
    <InputWrapper
      className="mb-[6px]"
      title={
        <div className="flex items-center">
          <p className="text-[#CED1D9]">
            <Trans>Price</Trans>
          </p>
        </div>
      }
    >
      <div className="flex justify-between gap-[12px] leading-[1]">
        <NumberInputPrimitive
          onValueChange={(e) => {
            setPrice(e.value)
          }}
          disabled={orderType === OrderType.MARKET}
          value={orderType === OrderType.MARKET ? marketPrice : price}
          className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
        />
        <div className="flex flex-shrink-0 items-center font-medium">
          {OrderType.MARKET !== orderType && (
            <p
              className="text-[12px] text-[#00E3A5]"
              role="button"
              onClick={() => setPrice(marketPrice)}
            >
              <Trans>Last</Trans>
            </p>
          )}
          <div className="ml-[12px] border-l-[1px] border-[#31333D] pl-[12px]">
            <TradeSelect
              value={orderType}
              onChange={(value) => {
                const orderType = value.target.value as OrderType
                setOrderType(orderType)
              }}
              options={[
                { label: <Trans>Limit</Trans>, value: OrderType.LIMIT },
                { label: <Trans>Market</Trans>, value: OrderType.MARKET },
              ]}
            />
          </div>
        </div>
      </div>
    </InputWrapper>
  )
}
