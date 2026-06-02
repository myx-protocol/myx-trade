import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useCookOrderStore } from '../store'
import { CookOrderSideEnum } from '../type'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

export const OrderSide = () => {
  const { orderSide, setOrderSide } = useCookOrderStore()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('side') || CookOrderSideEnum.Buy
    setOrderSide(tab as CookOrderSideEnum)
  }, [searchParams])

  const onChangeOrderSide = (side: CookOrderSideEnum) => {
    /**
     * before check
     */
    setSearchParams({ side: side })
  }
  return (
    <div className="flex rounded-[8px] bg-[#18191F]">
      <div
        className={clsx('flex w-[50%] items-center justify-center rounded-[8px] py-[12px]', {
          'bg-[linear-gradient(95.17deg,#3D996B_0%,#00996F_18.58%)]':
            orderSide === CookOrderSideEnum.Buy,
        })}
        role="button"
        onClick={() => {
          onChangeOrderSide(CookOrderSideEnum.Buy)
        }}
      >
        <span className="text-[13px] font-medium text-white">
          <Trans>Buy</Trans>
        </span>
      </div>
      <div
        className={clsx('flex w-[50%] items-center justify-center rounded-[8px] py-[12px]', {
          'bg-[linear-gradient(274.64deg,#C23749_3.47%,#BA4C47_99.82%)]':
            orderSide === CookOrderSideEnum.Sell,
        })}
        role="button"
        onClick={() => {
          onChangeOrderSide(CookOrderSideEnum.Sell)
        }}
      >
        <span className="text-[13px] font-medium text-white">
          <Trans>Sell</Trans>
        </span>
      </div>
    </div>
  )
}
