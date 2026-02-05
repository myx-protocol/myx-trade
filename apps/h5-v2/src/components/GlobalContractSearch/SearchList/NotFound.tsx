import EmptyPng from '@/assets/images/common/empty.png'
import { t } from '@lingui/core/macro'

export const NotFound = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center px-[16px] px-[20px] py-[16px]">
        <img src={EmptyPng} alt="empty" className="h-[56px] w-[56px]" />
        <div className="mt-[16px] leading-[1] font-medium text-[#848E9C] text-[12x]">{t`No results found`}</div>
        {/* <p className="mt-[12px] text-center leading-[1] font-medium text-[#848E9C] text-[12x]">
          {t`Create this market now, become a Genesis LP, and enjoy a permanent 2% commission dividend!`}
        </p> */}
        {/* <div
          onClick={handleCreateMarket}
          className="mt-[16px] cursor-pointer rounded-[9999px] bg-[#008C66] px-[40px] py-[12px] text-[12px] leading-[1] font-medium text-white select-none hover:opacity-80"
        >
          {t`Create Market`}
        </div> */}
      </div>
    </div>
  )
}
