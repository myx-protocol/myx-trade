import { Trans } from '@lingui/react/macro'
import { useCookOrderStore } from '../store'
import { CookOrderSideEnum } from '../type'

export const OrderButton = () => {
  const { orderSide } = useCookOrderStore()

  if (orderSide === CookOrderSideEnum.Buy) {
    return (
      <div
        role="button"
        className="mt-[12px] rounded-[8px] bg-[linear-gradient(116.96deg,rgba(128,255,149,0.5)_16.86%,rgba(0,230,167,0.5)_83.14%)] p-[1px] transition-opacity hover:opacity-80 active:opacity-70"
      >
        <div className="rounded-[inherit] bg-[linear-gradient(95.17deg,#3D996B_0%,#00996F_18.58%)] px-[20px] py-[15px] text-center text-[14px] leading-[1] font-bold text-white">
          <Trans>Buy</Trans>
        </div>
      </div>
    )
  }

  if (orderSide === CookOrderSideEnum.Sell) {
    return (
      <div
        role="button"
        className="mt-[12px] rounded-[8px] bg-[linear-gradient(270deg,#F66276_0%,#EC645E_81.25%)] p-[1px] transition-opacity hover:opacity-80 active:opacity-70"
      >
        <div className="rounded-[inherit] bg-[linear-gradient(274.64deg,#C23749_3.47%,#BA4C47_99.82%)] px-[20px] py-[15px] text-center text-[14px] leading-[1] font-bold text-white">
          <Trans>Sell</Trans>
        </div>
      </div>
    )
  }
}
