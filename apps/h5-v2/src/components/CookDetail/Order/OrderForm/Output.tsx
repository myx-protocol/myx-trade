import { Trans } from '@lingui/react/macro'
// import { useCookOrderStore } from '../store'
// import Wallet from '@/components/Icon/set/Wallet'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { CookCoin } from '../../CookCoin'
import IconHelp from '@/components/Icon/set/Help'

export const Output = () => {
  return (
    <div className="mt-[4px] rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
      {/* title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="text-[14px] font-normal text-[#CED1D9]">
            <Trans>Receive</Trans>
          </p>
          <span className="ml-[4px] flex">
            <IconHelp size={14} />
          </span>
        </div>
      </div>

      {/* form input wrap */}
      <div className="mt-[12px] flex items-center">
        <div className="flex-[1_1_0%]">
          <NumberInputPrimitive
            className="text-[32px] leading-[38px] font-bold"
            value={0}
            onChange={() => {}}
          />
        </div>
        {/* action */}
        <div className="ml-[12px] flex items-center">
          <CookCoin
            symbol="mBTC"
            logoUrl="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400"
          />
        </div>
      </div>
    </div>
  )
}
