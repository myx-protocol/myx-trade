import { RiseFallText } from '@/components/RiseFallText'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { formatNumber } from '@/utils/number'

export const MarketSwiperItem = () => {
  return (
    <div
      className="flex w-[180px] flex-shrink-0 items-center py-[12px] leading-[1] transition-opacity hover:opacity-60"
      role="button"
    >
      {/* symbol */}
      <div className="flex items-center">
        <CoinIcon
          size={16}
          icon="https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400"
        />
        <p className="ml-[2px] text-[12px] font-normal text-[#CED1D9]">BTCUSDT</p>
      </div>

      {/* price */}
      <p className="ml-[4px] text-[12px] font-medium">
        {/* <RiseFallText value={587.35} showPercent></RiseFallText> */}
      </p>

      {/* price */}
      <p className="ml-[4px] text-[12px] font-normal text-[#848E9C]">
        {formatNumber(108000, {
          showUnit: false,
        })}
      </p>
    </div>
  )
}
