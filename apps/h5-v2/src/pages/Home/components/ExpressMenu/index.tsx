import { toast } from '@/components/UI/Toast'
import { EXPRESS_MENU_LIST } from './const'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/core/macro'
import { SecondHeader } from '@/components/SecondHeader'
import { Trans } from '@lingui/react/macro'

export const ExpressMenu = () => {
  const navigate = useNavigate()

  const onItemClick = (url?: string) => {
    if (!url) {
      return toast.error({
        title: t`Coming soon`,
      })
    }
    navigate(url)
  }
  return (
    <div className="mt-[24px] px-[16px]">
      <div className="flex w-full flex-wrap justify-between gap-[12px]">
        {EXPRESS_MENU_LIST.map((item, index) => (
          <div
            key={index}
            role="button"
            onClick={() => onItemClick(item.href)}
            className="flex w-[48px] flex-shrink-0 flex-col items-center gap-[8px]"
          >
            <img src={item.icon} className="w-full" />
            <p className="linca-clamp-2 text-[10px]">{item.title()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
