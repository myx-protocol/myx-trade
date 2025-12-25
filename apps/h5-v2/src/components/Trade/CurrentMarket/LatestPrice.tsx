import { useMarketStore } from '../store/MarketStore'
import { Price } from '@/components/Price'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import useGlobalStore from '@/store/globalStore'

export const LatestPrice = () => {
  const { symbolInfo } = useGlobalStore()
  const tickerData = useMarketStore((state) => state.tickerData[symbolInfo?.poolId || ''])
  return (
    <div className="ml-[40px] min-w-[90px] leading-[1]">
      {/* price */}
      <p className="text-[16px] font-bold">
        <Price value={tickerData?.price || 0} showUnit={false} />
      </p>
      {/* change */}
      <p className="mt-[4px] text-[12px] font-medium text-white">
        <RiseFallTextPrecent value={tickerData?.change || 0} />
      </p>
    </div>
  )
}
