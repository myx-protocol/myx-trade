import { useGetAllQuoteTokenAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import useGlobalStore from '@/store/globalStore'
import IconArrowRight from '@/assets/svg/arrowRight.svg?react'
import ArrowRight from '@/components/UI/Icon/ArrowRight'

export const RenderAuthorizedTokens = ({
  isSingle,
  onClose,
}: {
  isSingle?: boolean
  onClose?: () => void
}) => {
  const { quoteTokenAuthStatus } = useGetAllQuoteTokenAuthStatus()
  const { setManageAuthorizedTokensDialogOpen } = useGlobalStore()

  const authorizedList = quoteTokenAuthStatus?.filter((item) => item.auth) ?? []
  const displayedTokens = authorizedList.slice(0, 3)

  return (
    <div
      className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]"
      style={{ gap: isSingle ? '4px' : '0px' }}
      onClick={() => {
        setManageAuthorizedTokensDialogOpen(true)
        onClose?.()
      }}
    >
      {!!authorizedList.length && !isSingle && (
        <div className="flex">
          {displayedTokens.map((item, index) => {
            return (
              <span key={item.quoteToken} className="text-[12px] text-[#848E9C]">
                {item.quoteSymbol}
                {index < displayedTokens.length - 1 && ','}
              </span>
            )
          })}
          {!isSingle && authorizedList.length > 3 && (
            <span className="text-[12px] text-[#848E9C]">+{authorizedList.length - 3}</span>
          )}
        </div>
      )}
      {isSingle ? (
        <ArrowRight color="#848E9C" width={7} height={11} />
      ) : (
        <IconArrowRight className="h-[16px] w-[16px]" />
      )}
    </div>
  )
}
