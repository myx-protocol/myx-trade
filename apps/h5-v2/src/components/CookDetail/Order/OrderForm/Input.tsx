import { Trans } from '@lingui/react/macro'
import { useCookOrderStore } from '../store'
import { CookOrderSideEnum } from '../type'
import Wallet from '@/components/Icon/set/Wallet'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { CookCoin } from '../../CookCoin'
import IconArrowDownLong from '@/components/Icon/set/ArrowDownLong'

export const Input = () => {
  const { orderSide } = useCookOrderStore()
  return (
    <div className="relative rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
      {/* title */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-normal text-[#CED1D9]">
          {orderSide === CookOrderSideEnum.Buy ? <Trans>Pay</Trans> : <Trans>Sell</Trans>}
        </p>
        {/* <s[an>] */}
        <p className="flex items-center gap-[4px]">
          <Wallet size={14} color="#848E9C" />
          <span className="text-[14px] font-medium text-[#CED1D9]">0.0000BTC</span>
        </p>
      </div>

      {/* form input wrap */}
      <div className="mt-[12px] flex items-center">
        <div className="w-[166px]">
          <NumberInputPrimitive
            className="text-[32px] leading-[38px] font-bold"
            value={0}
            onChange={() => {}}
          />
        </div>
        {/* action */}
        <div className="ml-[12px] flex items-center gap-[12px]">
          <div role="button" className="text-[14px] font-medium text-[#00E3A5]">
            <Trans>Max</Trans>
          </div>
          <CookCoin
            symbol="mBTC"
            logoUrl="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400"
            showDropdownIcon
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[37px] rounded-[12px] border-[4px] border-[#101114] bg-[#18191F] p-[13px] text-white">
        <IconArrowDownLong size={22} />
      </div>
    </div>
  )
}
