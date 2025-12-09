import { SecurityInfo } from './SecurityInfo'
import { TokenInfo } from './TokenInfo'

export const InfoContent = () => {
  return (
    <div className="px-[16px] py-[24px]">
      <TokenInfo />
      {/* divider */}
      <div className="my-[20px] h-[1px] bg-[#202129]" />
      <SecurityInfo />
    </div>
  )
}
