import { CoinIcon } from '@/components/UI/CoinIcon'
import Dropdown from '@/components/Icon/set/Dropdown'

interface CookCoinProps {
  logoUrl: string
  symbol: string
  showDropdownIcon?: boolean
}

export const CookCoin = ({ showDropdownIcon = false, symbol, logoUrl }: CookCoinProps) => {
  return (
    <div className="flex flex-shrink-0 items-center rounded-[9999px] border-[1px] border-[#31333D] bg-[#101114] py-[4px] pr-[6px] pl-[4px]">
      <CoinIcon icon={logoUrl} size={20} symbol={symbol} />
      <p className="ml-[3px] text-[14px] leading-[1] font-medium text-white">{symbol}</p>
      <div className="ml-[3px]">{showDropdownIcon && <Dropdown size={8} color="#848E9C" />}</div>
    </div>
  )
}
