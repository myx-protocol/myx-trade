import { LatestPrice } from './LatestPrice'
import { MarketData } from './MarketData'
import { SymbolInfo } from './SymbolInfo'

export const MarketInfo = () => {
  return (
    <div className="no-scrollbar flex w-full flex-nowrap items-center overflow-x-auto bg-[#101114] px-[20px] py-[20px]">
      <SymbolInfo />
      <LatestPrice />
      <MarketData />
    </div>
  )
}
