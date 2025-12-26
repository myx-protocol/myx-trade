import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { TradeSelect } from '@/components/Trade/components/Select'
import { useTradePanelStore } from '../../store'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import useGlobalStore from '@/store/globalStore'
import { useEffect } from 'react'
import { OrderType } from '@myx-trade/sdk'

export const PriceInput = () => {
  const { orderType, setOrderType, price, setPrice } = useTradePanelStore()
  const { tickerData } = useMarketStore()
  const { symbolInfo } = useGlobalStore()

  const marketPrice = tickerData[symbolInfo?.poolId as string]?.price ?? 0

  useEffect(() => {
    if (orderType === OrderType.MARKET) {
      setPrice(marketPrice?.toString() ?? '0')
    }
  }, [orderType, marketPrice, setPrice])

  return (
    <InputWrapper
      className="mb-[6px]"
      title={
        <div className="flex items-center">
          <p style={{ color: orderType === OrderType.MARKET ? '#848E9C' : '#CED1D9' }}>
            <Trans>Price</Trans>
          </p>
        </div>
      }
    >
      <div className="flex justify-between gap-[12px] leading-[1]">
        {orderType === OrderType.MARKET ? (
          // MARKET 模式：显示格式化后的价格（只读展示）
          <>
            <p className="h-[22px] w-full flex-grow-[1] text-[20px] leading-[22px] font-bold text-[#6D7180]">
              <Trans>Market price</Trans>
            </p>
            <NumberInputPrimitive
              disabled={true}
              value={price}
              className="hidden w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
            />
          </>
        ) : (
          // LIMIT 模式：正常输入框
          <NumberInputPrimitive
            onValueChange={(e) => {
              setPrice(e.value)
            }}
            value={price}
            className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
          />
        )}
        <div className="flex flex-shrink-0 items-center font-medium">
          {OrderType.MARKET !== orderType && (
            <p
              className="text-[12px] text-[#00E3A5]"
              role="button"
              onClick={() => setPrice(marketPrice?.toString() ?? '0')}
            >
              <Trans>Last</Trans>
            </p>
          )}
          <div className="ml-[12px] pl-[12px]">
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
